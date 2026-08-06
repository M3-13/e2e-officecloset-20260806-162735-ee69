from io import BytesIO

from fastapi import HTTPException, UploadFile
from PIL import Image

MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_image(file: UploadFile) -> None:
    header = file.file.read(4)
    file.file.seek(0)

    is_jpeg = header[:3] == b"\xff\xd8\xff"
    is_png = header[:4] == b"\x89PNG"

    if not is_jpeg and not is_png:
        raise HTTPException(
            status_code=400, detail="Invalid image type. Only JPEG and PNG are allowed."
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB.")


def strip_exif(file: UploadFile) -> bytes:
    file.file.seek(0)
    img = Image.open(file.file)
    if img.mode != "RGB":
        img = img.convert("RGB")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_thumbnail(data: bytes, size: tuple[int, int] = (300, 300)) -> bytes:
    img = Image.open(BytesIO(data))
    img.thumbnail(size)
    if img.mode != "RGB":
        img = img.convert("RGB")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()
