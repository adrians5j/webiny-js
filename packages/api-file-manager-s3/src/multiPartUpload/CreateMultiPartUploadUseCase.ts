import S3 from "aws-sdk/clients/s3";
import { FileData } from "~/types";

interface CreateMultiPartUploadParams {
    file: FileData;
    numberOfParts: number;
}

export class CreateMultiPartUploadUseCase {
    private readonly s3: S3;
    private readonly bucket: string;

    constructor(bucket: string, s3Client: S3) {
        this.bucket = bucket;
        this.s3 = s3Client;
    }

    async execute({ file, numberOfParts }: CreateMultiPartUploadParams) {
        const s3Params = { Bucket: this.bucket, Key: file.key };

        const { UploadId } = await this.s3.createMultipartUpload(s3Params).promise();

        const parts = await Promise.all(
            Array.from({ length: numberOfParts }).map((_, index) => {
                return this.s3
                    .getSignedUrlPromise("uploadPart", {
                        ...s3Params,
                        UploadId,
                        PartNumber: index + 1,
                        // URL expires after 24 hours.
                        Expires: 86400
                    })
                    .then(url => ({
                        url,
                        partNumber: index + 1
                    }));
            })
        );

        return {
            file,
            uploadId: UploadId,
            parts
        };
    }
}
