import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from "aws-sdk";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

@Controller("uploads")
export class UploadsController {
  @Post("")
  @UseInterceptors(
    FileInterceptor("file", {
      dest: "./uploads",
      preservePath: true,
    })
  )
  async uploadFile(@UploadedFile() file) {
    try {
      return { url: `http://localhost:4000/${file.filename}` };
    } catch (e) {
      return null;
    }
  }

  @Post("/s3")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFileS3(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      },
    });
    try {
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: "public-read",
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      return null;
    }
  }
}
