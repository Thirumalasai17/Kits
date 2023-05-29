from db import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import ARRAY


class ClabKitPreparationModel(db.Model):
    __tablename__ = "clab_kit_preparation"
    # extend_existing=True
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    protocol_id = db.Column(UUID(as_uuid=True), db.ForeignKey("cro_protocol.id"))
    central_lab_id = db.Column(db.String)
    kit_id = db.Column(db.String)
    preparation_status = db.Column(db.String)
    status = db.Column(db.String)
    assigned_site_id = db.Column(db.String)

    @classmethod
    def find_all(cls):
        return cls.query.all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
