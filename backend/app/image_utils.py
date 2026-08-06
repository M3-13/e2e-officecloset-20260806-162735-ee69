from fastapi import UploadFile


def validate_image(file: UploadFile) -> None:
    return


def strip_exif(file: UploadFile) -> bytes:
    return b""


def create_thumbnail(data: bytes, size: tuple[int, int] = (300, 300)) -> bytes:
    return b""
