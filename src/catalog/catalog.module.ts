import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { StandardSystem, StandardSystemSchema } from './schemas/standard-system.schema'
import { CatalogService } from './catalog.service'
import { AdminCatalogController, CatalogController } from './catalog.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: StandardSystem.name, schema: StandardSystemSchema }])],
  controllers: [CatalogController, AdminCatalogController],
  providers: [CatalogService],
  exports: [CatalogService, MongooseModule],
})
export class CatalogModule {}
