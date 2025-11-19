from sqlalchemy.orm import session 
from . import models, schemas
from . import authentication
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: session.Session, email: str, password: str):
    pw = get_password_hash(password)
    db_user = models.User(email = email, password=pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_password_hash(password):
    return pwd_context.hash(password)

def update_user(db: session.Session, user: models.User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(db: session.Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_all_users(db: session.Session):
    return db.query(models.User).all()

def authenticate_user(db: session.Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def verify_password(plain_password, password):
    return pwd_context.verify(plain_password, password)



def get_all_products(db: session.Session):
    return db.query(models.Product).all()

def get_cart_items(db: session.Session, user_id: int):
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if cart:
        return cart.cart_items
    return []

def add_to_cart(db: session.Session, user_id: int, product_id: int, quantity: int):
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if not cart:
        cart = models.Cart(user_id=user_id)
        db.add(cart)
        db.flush() 
    
    product = db.query(models.Product).filter(product_id == models.Product.id).first()#type: ignore
    if not product or product.stock < quantity: #type: ignore
        raise ValueError("Product not available in sufficient quantity")
    
    item = (db.query(models.CartItem)
                .filter(models.CartItem.cart_id == cart.user_id,
                        models.CartItem.product_id == product_id)
                .first())
    if item:
        item.quantity += quantity #type: ignore
    else:
        item = models.CartItem(
            cart_id = cart.user_id,
            title = product.title,
            product_id = product_id,
            quantity = quantity,
            price = product.price   
        )
        db.add(item)
    
    db.commit()
    db.refresh(item)
    return item


def delete_cart_item(db: session.Session, user_id: int, product_id: int):
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if not cart:
        raise ValueError("Cart not found")
    
    item = (db.query(models.CartItem)
                .filter(models.CartItem.cart_id == cart.user_id,
                        models.CartItem.product_id == product_id)
                .first())
    if not item:
        raise ValueError("Item not found in cart")
    
    db.delete(item)
    db.commit()
    return {"detail": "Item removed from cart"}


def checkout(db : session.Session, user_id: int):
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if not cart or not cart.cart_items:
        raise ValueError("Cart is empty")
    total_amount = sum(item.quantity * item.price for item in cart.cart_items)
    order = models.Order(user_id=user_id, total_price=total_amount)
    db.add(order)
    db.flush()  # Ensure order.id is generated
    for item in cart.cart_items:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            title=item.title,
            quantity=item.quantity,
            price=item.price
        )
        db.add(order_item)
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.stock -= item.quantity  #type: ignore
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.user_id).delete()
    db.commit()
    db.refresh(order)
    return


def get_companies_orders(db: session.Session, user: models.User):
    company_id = db.query(models.Company).filter(models.Company.admin_id == user.id).first().id #type: ignore
    orders = (db.query(models.OrderItem)
                .join(models.Product, models.OrderItem.product_id == models.Product.id)
                .filter(models.Product.company_id == company_id)
                .all()
            )
    return orders
    
    
def get_companies_products(db: session.Session, user: models.User):
    company_id = db.query(models.Company).filter(models.Company.admin_id == user.id).first().id #type: ignore
    products = db.query(models.Product).filter(models.Product.company_id == company_id).all() #type: ignore
    return products

def update_product(db: session.Session, product: models.Product):
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def change_cart_item_quantity(db: session.Session, user_id: int, product_id: int, delta: int):
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if not cart:
        raise ValueError("Cart not found")

    item = (db.query(models.CartItem)
                .filter(models.CartItem.cart_id == cart.user_id,
                        models.CartItem.product_id == product_id)
                .first())
    if not item:
        raise ValueError("Item not found in cart")
    
    new_quantity = item.quantity + delta #type: ignore
    if new_quantity < 1: #type: ignore
        db.delete(item)
    else:
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product or product.stock < new_quantity: #type: ignore
            raise ValueError("Product not available in sufficient quantity")
        item.quantity = new_quantity #type: ignore
    
    db.commit()
    db.refresh(item)
    return item