import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file' }, { status: 400 });
    }

    // MOCK S3 UPLOAD: Trong môi trường thực tế, đoạn này sẽ đẩy file lên AWS S3
    // const s3Client = new S3Client({...})
    // await s3Client.send(new PutObjectCommand({...}))

    const fakeS3Url = `https://s3.amazonaws.com/agri-wms-bucket/evidence_${Date.now()}.jpg`;

    return NextResponse.json({ success: true, url: fakeS3Url });
  } catch (error: any) {
    console.error('[POST /api/upload/evidence]', error);
    return NextResponse.json({ error: 'Lỗi upload ảnh' }, { status: 500 });
  }
}
