import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Quote, QuoteDocument } from '../quotes/schemas/quote.schema'
import { ContactMessage, ContactMessageDocument } from '../contact/schemas/contact-message.schema'
import { Application, ApplicationDocument, Job, JobDocument } from '../careers/schemas/job.schema'
import { Subscriber, SubscriberDocument } from '../newsletter/schemas/subscriber.schema'
import { AnalyticsEvent, AnalyticsEventDocument } from '../analytics/schemas/analytics-event.schema'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Quote.name) private readonly quotes: Model<QuoteDocument>,
    @InjectModel(ContactMessage.name) private readonly messages: Model<ContactMessageDocument>,
    @InjectModel(Application.name) private readonly applications: Model<ApplicationDocument>,
    @InjectModel(Job.name) private readonly jobs: Model<JobDocument>,
    @InjectModel(Subscriber.name) private readonly subscribers: Model<SubscriberDocument>,
    @InjectModel(AnalyticsEvent.name) private readonly events: Model<AnalyticsEventDocument>,
  ) {}

  async overview(days = 30) {
    const now = new Date()
    const since = new Date(now.getTime() - days * 86400_000)
    const last7 = new Date(now.getTime() - 7 * 86400_000)
    const dayAgo = new Date(now.getTime() - 86400_000)

    const [
      totalQuotes,
      statusRows,
      recentQuotes,
      totalApplications,
      newApplications,
      totalMessages,
      newMessages,
      totalSubscribers,
      eventsRange,
      topEvents,
      daily,
      quoteSubmits,
      contactSubmits,
      needsAttention,
      valueRow,
      sourceRows,
      topPages,
      openJobs,
    ] = await Promise.all([
      this.quotes.countDocuments(),
      this.quotes.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: { $ifNull: ['$value', 0] } } } },
      ]),
      this.quotes
        .find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('ref status priority value projectType projectTypeLabel name company email estimate createdAt updatedAt followUpAt')
        .lean(),
      this.applications.countDocuments(),
      this.applications.countDocuments({ status: 'new' }),
      this.messages.countDocuments(),
      this.messages.countDocuments({ status: 'new' }),
      this.subscribers.countDocuments({ status: 'active' }),
      this.events.countDocuments({ createdAt: { $gte: since } }),
      this.events.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, name: '$_id', count: 1 } },
      ]),
      this.events.aggregate([
        { $match: { createdAt: { $gte: since }, name: 'page_view' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            views: { $sum: 1 },
            sessions: { $addToSet: '$sessionId' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', views: 1, sessions: { $size: '$sessions' } } },
      ]),
      this.events.countDocuments({ name: 'quote_submit', createdAt: { $gte: since } }),
      this.events.countDocuments({ name: 'contact_submit', createdAt: { $gte: since } }),
      this.quotes.countDocuments({
        status: { $in: ['received', 'engineering_review'] },
        createdAt: { $lte: dayAgo },
      }),
      this.quotes.aggregate([
        { $match: { status: { $nin: ['cancelled', 'closed'] } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$value', 0] } } } },
      ]),
      this.quotes.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, source: '$_id', count: 1 } },
      ]),
      this.events.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$path', count: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
        { $project: { _id: 0, path: '$_id', count: 1, sessions: { $size: '$sessions' } } },
      ]),
      this.jobs.countDocuments({ active: true }),
    ])

    const quoteStatus: Record<string, { count: number, value: number }> = {}
    let quotedValue = 0
    for (const row of statusRows as { _id: string, count: number, value: number }[]) {
      quoteStatus[row._id] = { count: row.count, value: row.value }
      if (['quoted', 'approved', 'in_build'].includes(row._id)) quotedValue += row.value
    }

    const approved = (quoteStatus.approved?.count ?? 0) + (quoteStatus.in_build?.count ?? 0) + (quoteStatus.shipped?.count ?? 0) + (quoteStatus.closed?.count ?? 0)
    const conversionRate = totalQuotes > 0 ? Math.round((approved / totalQuotes) * 100) : 0
    const newThisRange = await this.quotes.countDocuments({ createdAt: { $gte: since } })
    const totalPipelineValue = (valueRow as { total: number }[])[0]?.total ?? 0

    return {
      generatedAt: now.toISOString(),
      rangeDays: days,
      quotes: {
        total: totalQuotes,
        status: quoteStatus,
        newInRange: newThisRange,
        conversionRate,
        needsAttention,
        quotedValue,
        pipelineValue: totalPipelineValue,
        recent: recentQuotes,
      },
      messages: { total: totalMessages, unread: newMessages },
      applications: { total: totalApplications, new: newApplications },
      jobs: { active: openJobs },
      subscribers: { active: totalSubscribers },
      analytics: {
        eventsInRange: eventsRange,
        quoteSubmits,
        contactSubmits,
        topEvents,
        topPages,
        sources: sourceRows,
        daily,
        eventsLast7Days: await this.events.countDocuments({ createdAt: { $gte: last7 } }),
      },
    }
  }

  async analytics(days = 30) {
    const since = new Date(Date.now() - days * 86400_000)
    const [daily, topPages, topEvents, sources, formStarts, submissions, sessions] = await Promise.all([
      this.events.aggregate([
        { $match: { createdAt: { $gte: since }, name: 'page_view' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            views: { $sum: 1 },
            sessions: { $addToSet: '$sessionId' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', views: 1, sessions: { $size: '$sessions' } } },
      ]),
      this.events.aggregate([
        { $match: { createdAt: { $gte: since }, name: 'page_view' } },
        { $group: { _id: '$path', views: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
        { $sort: { views: -1 } },
        { $limit: 20 },
        { $project: { _id: 0, path: '$_id', views: 1, sessions: { $size: '$sessions' } } },
      ]),
      this.events.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 },
        { $project: { _id: 0, name: '$_id', count: 1 } },
      ]),
      this.events.aggregate([
        { $match: { createdAt: { $gte: since }, name: 'page_view' } },
        { $group: { _id: { $ifNull: ['$meta.referrer', 'direct'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, source: '$_id', count: 1 } },
      ]),
      this.events.countDocuments({ name: 'quote_view', createdAt: { $gte: since } }),
      this.quotes.countDocuments({ createdAt: { $gte: since } }),
      this.events.distinct('sessionId', { createdAt: { $gte: since } }),
    ])

    const quoteViews = formStarts
    return {
      rangeDays: days,
      daily,
      topPages,
      topEvents,
      sources,
      conversions: {
        sessions: sessions.length,
        quoteViews,
        submissions,
        viewToSubmit: quoteViews > 0 ? Math.round((submissions / quoteViews) * 100) : 0,
      },
    }
  }
}
