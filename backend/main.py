from jose import jwt
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import session, selectinload, Session
from fastapi.middleware.cors import CORSMiddleware
from . import operations, models, schemas, authentication
from .database import get_db, engine, SessionLocal
from .authentication import get_current_user, create_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


models.Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register/", response_model = schemas.User)
def create_user_endpoint(form_data: OAuth2PasswordRequestForm = Depends(), db: session = Depends(get_db)): # type: ignore
    return operations.create_user(db=db, email=form_data.username, password=form_data.password) # type: ignore

@app.get("/user/profile", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(authentication.get_current_user)): # type: ignore
    return current_user
    
@app.patch("/user/profile", response_model=schemas.User)
def update_user_profile(update: schemas.UserUpdate, db: session = Depends(get_db), current_user: models.User = Depends(authentication.get_current_user)): # type: ignore
    if update.name is not None:
        current_user.name = update.name # type: ignore
    if update.password:
        current_user.password = operations.get_password_hash(update.password) # type: ignore
    if update.country is not None:
        current_user.country = update.country
    if update.city is not None:
        current_user.city = update.city
    if update.district is not None:
        current_user.district = update.district
    if update.street is not None:
        current_user.street = update.street
    if update.full_address is not None:
        current_user.full_address = update.full_address
    operations.update_user(db=db, user=current_user) # type: ignore
    return current_user

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user_endpoint(user_id: int, db: session = Depends(get_db)): # type: ignore
    db_user = operations.get_user(db=db, user_id=user_id) # type: ignore
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/users/", response_model=list[schemas.User])
def get_users_endpoint(db: session = Depends(get_db)): # type: ignore
    return operations.get_all_users(db=db) # type: ignore


@app.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: session = Depends(get_db)): # type: ignore
    user = operations.authenticate_user(db=db, email=form_data.username, password=form_data.password) # type: ignore
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = authentication.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/products", response_model=list[schemas.ProductOut])
def get_products(current_user: models.User = Depends(authentication.get_current_user),
                 db: session = Depends(get_db)):  # type: ignore
    products = (
        db.query(models.Product) # type: ignore
          .options(selectinload(models.Product.product_images))
          .all()
    )
    return products

@app.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, current_user: models.User = Depends(authentication.get_current_user),
                 db: session = Depends(get_db)):  # type: ignore
    product = (
        db.query(models.Product) # type: ignore
          .options(selectinload(models.Product.product_images))
          .filter(models.Product.id == product_id)
          .first()
    )
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/cart")
def get_cart(current_user: models.User = Depends(authentication.get_current_user),
              db: session = Depends(get_db)):  # type: ignore
    cart_items = operations.get_cart_items(db=db, user_id=current_user.id)  # type: ignore
    return cart_items

@app.post("/cart/add/{product_id}/{quantity}")
def add_to_cart(product_id: int, quantity: int, current_user: models.User = Depends(authentication.get_current_user),
                 db: session = Depends(get_db)):  # type: ignore
    return operations.add_to_cart(db=db, user_id=current_user.id, product_id=product_id, quantity=quantity)  # type: ignore

@app.delete("/cart/delete_item/{product_id}")
def delete_cart_item(product_id: int, current_user: models.User = Depends(authentication.get_current_user),
                      db: session = Depends(get_db)):  # type: ignore
    operations.delete_cart_item(db=db, user_id=current_user.id, product_id=product_id)  # type: ignore
    return {"detail": "Item removed from cart"}

@app.get("/orders", response_model=list[schemas.OrderOut])
def get_orders(current_user: models.User = Depends(authentication.get_current_user),
               db: session = Depends(get_db)):  # type: ignore
    orders = (db.query(models.Order) # type: ignore
                .options(selectinload(models.Order.order_items))
                .filter(models.Order.user_id == current_user.id)
                .all())
    return orders

@app.post("/cart/checkout")
def checkout(current_user: models.User = Depends(authentication.get_current_user),
            db: session = Depends(get_db)): # type: ignore
    return operations.checkout(db=db, user_id=current_user.id) # type: ignore

@app.get("/products/search/{term}", response_model=list[schemas.ProductOut])
def search_products(term: str, current_user: models.User = Depends(authentication.get_current_user),
                    db: session = Depends(get_db)):  # type: ignore

    safe_term = term.replace('%', '')
    like_pattern = f"%{safe_term}%"
    products = (
        db.query(models.Product)  # type: ignore
          .options(selectinload(models.Product.product_images))
          .filter(
              models.Product.title.ilike(like_pattern) |  # type: ignore
              models.Product.description.ilike(like_pattern)  # type: ignore
          )
          .all()
    )
    print(products)
    return products

@app.post("/logout")
def logout(token: str = Depends(oauth2_scheme),
        current_user: models.User = Depends(authentication.get_current_user),
        db: session = Depends(get_db)):  # type: ignore
    authentication.invalidate_token(token=token, db=db)  # type: ignore
    return {"detail": "Successfully logged out"}

@app.get("/admin")
def admin_panel(user = Depends(authentication.require_roles(["admin"]))):  # type: ignore
    if user is None:
        raise HTTPException(status_code=403, detail="Not authorized")
    orders = operations.get_companies_orders(db=SessionLocal(), user=user)
    return orders

@app.get("/authentication")
def auth_user(user = Depends(authentication.get_current_user)):
    return user

@app.get("/admin/products", response_model=list[schemas.ProductOut])
def admin_products(user = Depends(authentication.require_roles(["admin"])), db: session = Depends(get_db)):  # type: ignore
    if user is None:
        raise HTTPException(status_code=403, detail="Not authorized")
    products = operations.get_companies_products(db=db, user=user)  # type: ignore
    return products

@app.post("/admin/products/edit/{product_id}", response_model=schemas.ProductOut)
def edit_product(product_id: int, update: schemas.ProductUpdate,
                 user = Depends(authentication.require_roles(["admin"])),
                 db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=403, detail="Not authorized")
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if update.title is not None:
        product.title = update.title # type: ignore
    if update.description is not None:
        product.description = update.description # type: ignore
    if update.price is not None:
        product.price = update.price # type: ignore
    if update.stock is not None:
        product.stock = update.stock # type: ignore
    if update.category_id is not None:
        product.category_id = update.category_id # type: ignore
    if update.product_images is not None:
        db.query(models.ProductImage).filter(models.ProductImage.product_id == product.id).delete(synchronize_session=False)
        for image_url in update.product_images:
            if image_url:
                db.add(models.ProductImage(product_id=product.id, image_url=image_url))
    operations.update_product(db=db, product=product)
    return product

@app.delete("/admin/products/{product_id}")
def delete_product(product_id: int,
                   user = Depends(authentication.require_roles(["admin"])),
                   db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=403, detail="Not authorized")
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted successfully"}

@app.post("/admin/products", response_model=schemas.ProductOut)
def create_product(create: schemas.ProductCreate,
                    user = Depends(authentication.require_roles(["admin"])),
                    db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=403, detail="Not authorized")
    company = db.query(models.Company).filter(models.Company.admin_id == user.id).first()
    if company is None:
        raise HTTPException(status_code=400, detail="Admin does not have a company")
    new_product = models.Product(
        title=create.title,
        description=create.description,
        price=create.price,
        stock=create.stock,
        category_id=create.category_id,
        company_id=company.id
    )
    db.add(new_product)
    db.flush()  # Ensure new_product.id is generated
    for image_url in create.product_images: # type: ignore
        if image_url:
            db.add(models.ProductImage(product_id=new_product.id, image_url=image_url))
    db.commit()
    db.refresh(new_product)
    return new_product

@app.post("/cart/increase/{product_id}")
def increase_cart_item(product_id: int, current_user: models.User = Depends(authentication.get_current_user),
                      db: session = Depends(get_db)):  # type: ignore
    return operations.change_cart_item_quantity(db=db, user_id=current_user.id, product_id=product_id, delta=1)  # type: ignore

@app.post("/cart/decrease/{product_id}")
def decrease_cart_item(product_id: int, current_user: models.User = Depends(authentication.get_current_user),
                      db: session = Depends(get_db)):  # type: ignore
    return operations.change_cart_item_quantity(db=db, user_id=current_user.id, product_id=product_id, delta=-1)  # type: ignore 