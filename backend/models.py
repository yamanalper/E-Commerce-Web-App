from datetime import datetime
from sqlalchemy import Column, DateTime,Integer, String, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey

class BaseModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class Address:
    country = Column(String, index=True)
    city = Column(String, index=True)
    street = Column(String, index=True)
    district = Column(String, index=True)
    full_address = Column(String, index=True)
    

class User(BaseModel, Address):
    __tablename__ = "users"
    
    name = Column(String, index=True)
    surname = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_active = Column(Boolean, default=False) 
    orders = relationship("Order", back_populates="user")
    cart = relationship("Cart", back_populates="user", uselist=False)
    role = Column(String, nullable= False ,default="user")
    company = relationship("Company", back_populates="admin")
    # add mail verification for activation
    
class Cart(BaseModel):
    __tablename__ = "carts"

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="cart")
    cart_items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    
class CartItem(BaseModel):
    __tablename__ = "cart_items"

    cart_id = Column(Integer, ForeignKey("carts.user_id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    price = Column(Integer)
    title = Column(String, index=True)

    cart = relationship("Cart", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

class Category(BaseModel):
    __tablename__ = "categories"
    
    name = Column(String, index=True)
    category_images = relationship("CategoryImages", back_populates="category")
    products = relationship("Product", back_populates="category")

class CategoryImages(BaseModel):
    __tablename__ = "category_images"

    category_id = Column(Integer, ForeignKey("categories.id"))
    image_url = Column(String, index=True)
    category = relationship("Category", back_populates="category_images")

class Product(BaseModel):
    __tablename__ = "products"

    title = Column(String, index=True)
    description = Column(String, index=True)
    price = Column(Integer)
    stock = Column(Integer)
    category_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        index=True
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="SET NULL"),
        index=True
    )
    category = relationship("Category", back_populates="products")
    company = relationship("Company", back_populates="products")
    product_images = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    cart_items = relationship("CartItem", back_populates="product")
    

class ProductImage(BaseModel):
    __tablename__ = "product_images"
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    image_url = Column(String, index=True)
    product = relationship("Product",back_populates="product_images")


class Order(BaseModel):
    __tablename__ = "orders"

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )
    user = relationship("User" , back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    total_price = Column(Integer)
    status = Column(String, default="Pending")
    
class OrderItem(BaseModel):
    __tablename__ = "order_items"
    
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    price = Column(Integer)
    title = Column(String, index=True)
    status = Column(String, default="Pending")

    order = relationship("Order", back_populates="order_items")
    
class Company(BaseModel, Address):
    __tablename__ = "companies"

    name = Column(String, index=True)
    phone = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    website = Column(String, index=True)
    products = relationship("Product", back_populates="company")
    admin_id = Column(Integer, ForeignKey("users.id"))
    admin = relationship("User")
    
class TokenBlacklist(BaseModel):
    __tablename__ = "token_blacklist"
    
    token = Column(String, unique=True, index=True)
