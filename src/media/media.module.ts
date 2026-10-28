import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MediaAsset, MediaAssetSchema } from './schemas/media-asset.schema'
import { MediaService } from './media.service'
import { MediaController } from './media.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: MediaAsset.name, schema: MediaAssetSchema }])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService, MongooseModule],
})
export class MediaModule {}
