import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthUser, CurrentUser, Roles } from '../auth/decorators/auth.decorators'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CareersService } from './careers.service'
import { AddApplicationNoteDto, CreateJobDto, UpdateApplicationDto, UpdateJobDto } from './dto/job.dto'

@ApiTags('admin-careers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin', 'ops')
@Controller('admin')
export class AdminCareersController {
  constructor(private readonly careers: CareersService) {}

  @Get('jobs')
  async jobs() {
    return await this.careers.adminJobs()
  }

  @Post('jobs')
  async createJob(@Body() dto: CreateJobDto, @CurrentUser() user: AuthUser) {
    return await this.careers.createJob(dto, { id: user.id, email: user.email, name: user.name })
  }

  @Patch('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto, @CurrentUser() user: AuthUser) {
    return await this.careers.updateJob(id, dto, { id: user.id, email: user.email, name: user.name })
  }

  @Delete('jobs/:id')
  async removeJob(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return await this.careers.removeJob(id, { id: user.id, email: user.email, name: user.name })
  }

  @Get('applications')
  async applications(
    @Query('status') status?: string,
    @Query('job') job?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.careers.adminListApplications({
      status,
      job,
      q,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    })
  }

  @Get('applications/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="vomtek-applications.csv"')
  async export(@Res() res: Response) {
    res.send(await this.careers.exportApplicationsCsv())
  }

  @Get('applications/:id')
  async application(@Param('id') id: string) {
    return await this.careers.applicationDetail(id)
  }

  @Patch('applications/:id')
  async updateApplication(@Param('id') id: string, @Body() dto: UpdateApplicationDto, @CurrentUser() user: AuthUser) {
    return await this.careers.updateApplication(id, dto, { id: user.id, email: user.email, name: user.name })
  }

  @Post('applications/:id/notes')
  async addApplicationNote(@Param('id') id: string, @Body() dto: AddApplicationNoteDto, @CurrentUser() user: AuthUser) {
    return await this.careers.addApplicationNote(id, dto, { id: user.id, email: user.email, name: user.name })
  }
}
