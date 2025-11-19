from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel): 
    email: str
    password: str


class User(BaseModel):
    id: int
    name: str | None = None
    email: str
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    is_active: bool
    country: str | None = None
    city: str | None = None
    district: str | None = None
    street: str | None = None
    full_address: str | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
    
    
class UserUpdate(BaseModel):
    name: str | None = None
    password: str | None = None
    country: str | None = None
    city: str | None = None
    district: str | None = None
    street: str | None = None
    full_address: str | None = None
    
class ProductImage(BaseModel):
    id: int
    image_url: str
    class Config:
        from_attributes = True

class ProductOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    price: int
    stock: int
    product_images: list[ProductImage] = []
    category_id: int | None = None

    class Config:
        from_attributes = True

class OrderItem(BaseModel):
    id: int
    product_id: int
    title: str
    quantity: int
    price: int
    status: str

    class Config:
        from_attributes = True
        
class OrderOut(BaseModel):
    id: int
    total_price: int
    created_at: datetime
    order_items: list[OrderItem] = []
    status : str

    class Config:
        from_attributes = True
        
class ProductUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: int | None = None
    stock: int | None = None
    category_id: int | None = None
    product_images: list[str] | None = None  # List of image URLs
    
    class Config:
        from_attributes = True
        
class ProductCreate(BaseModel):
    title: str
    description: str | None = None
    price: int
    stock: int
    category_id: int | None = None
    product_images: list[str] | None = None  # List of image URLs
    
    class Config:
        from_attributes = True
    
    
