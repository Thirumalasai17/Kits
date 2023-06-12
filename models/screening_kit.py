from db import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import ARRAY


class ScreeningKitDetailsModel(db.Model):
    __tablename__ = "screening_kit_details"
    # extend_existing=True
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    protocol_id = db.Column(UUID(as_uuid=True), db.ForeignKey("cro_protocol.id"))
    screening_kit_count = db.Column(db.Integer)
    lab_test_ids = db.Column(ARRAY(db.String))
    meterial_details = db.Column(JSONB)

    @classmethod
    def find_all(cls):
        return cls.query.all()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
