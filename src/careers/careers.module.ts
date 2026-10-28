import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CareersController } from './careers.controller'
import { AdminCareersController } from './admin-careers.controller'
import { CareersService } from './careers.service'
import { Application, ApplicationSchema, Job, JobSchema } from './schemas/job.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
    ]),
  ],
  controllers: [CareersController, AdminCareersController],
  providers: [CareersService],
  exports: [CareersService, MongooseModule],
})
export class CareersModule {}
