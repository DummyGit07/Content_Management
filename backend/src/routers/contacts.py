from fastapi import APIRouter, Depends, HTTPException, status
from src.schemas.contact import Contact
from src.database.db import get_db
from typing import Annotated
from sqlalchemy.orm import Session
from src.routers.login import get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/contacts",
    tags=["Contacts"]
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


class ContactRequest(BaseModel):
    name: str
    number: str


# --- Get all contacts belonging to the logged-in user ---
@router.get("")
def get_all_contacts(user: user_dependency, db: db_dependency):
    if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UnAuthorised")
    

    contacts = db.query(Contact).filter(
        Contact.owner_id == user.get("id")
    ).all()

    return contacts


# --- Add a new contact ---
@router.post("", status_code=status.HTTP_201_CREATED)
def add_contact(
    user: user_dependency,
    db: db_dependency,
    contact_request: ContactRequest
):
    if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UnAuthorised")
    

    contact_model = Contact(
        **contact_request.model_dump(),
        owner_id=user.get("id")
    )

    db.add(contact_model)
    db.commit()
    db.refresh(contact_model)

    return {
        "message": "Contact added successfully",
        "contact": contact_model
    }


# --- Delete a contact ---
@router.delete("/{contact_id}")
def delete_contact(
    user: user_dependency,
    db: db_dependency,
    contact_id: int
):
    if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UnAuthorised")
    

    contact_model = db.query(Contact).filter(
        Contact.owner_id == user.get("id"),
        Contact.id == contact_id
    ).first()

    if not contact_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    db.delete(contact_model)
    db.commit()

    return {
        "message": "Contact deleted successfully"
    }


# --- Update a contact ---
@router.put("/{contact_id}")
def update_contact(
    user: user_dependency,
    db: db_dependency,
    contact_id: int,
    updated_contact: ContactRequest
):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UnAuthorised")


    contact_model = db.query(Contact).filter(
        Contact.owner_id == user.get("id"),
        Contact.id == contact_id
    ).first()

    if not contact_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    contact_model.name = updated_contact.name
    contact_model.number = updated_contact.number

    db.commit()
    db.refresh(contact_model)

    return {
        "message": "Contact updated successfully",
        "contact": contact_model
    }
