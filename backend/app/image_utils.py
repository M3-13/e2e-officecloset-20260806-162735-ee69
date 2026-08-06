import io

from fastapi import HTTPException, UploadFile
from PIL import Image

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

JPEG_MAGIC = b"\xff\xd8\xff"
PNG_MAGIC = b"\x89\x50\x4e\x47"


def validate_image(file: UploadFile) -> None:
    file.file.seek(0)
    header = file.file.read(4)
    file.file.seek(0)

    if header[:3] == JPEG_MAGIC or header[:4] == PNG_MAGIC:
        pass
    else:
        file.file.seek(0)
        raise HTTPException(
            status_code=400,
            detail="Invalid image type. Only JPEG and PNG are allowed.",
        )

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_FILE_SIZE:
        file.file.seek(0)
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5 MB.",
        )


def strip_exif(file: UploadFile) -> bytes:
    try:
        img = Image.open(file.file)
        if img.mode not in ("RGB",):
            img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
    except Exception as err:
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image file.",
        ) from err
    return buf.getvalue()


def create_thumbnail(data: bytes, size: tuple[int, int] = (300, 300)) -> bytes:
    try:
        img = Image.open(io.BytesIO(data))
        img.thumbnail(size, Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
    except Exception as err:
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image data.",
        ) from err
    return buf.getvalue()
