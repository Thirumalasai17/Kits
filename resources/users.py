from flask import request
from flask_restx import Resource, fields, Namespace

from models.users import UserModel
import os
from mail import send_mail
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    current_user,
    get_jwt,
)
from sqlalchemy import exc
from resources.utils import generate_otp, get_otp_email_template
from datetime import datetime
from config import logger
from schemas.users import UserSchema


login_ns = Namespace("login", description="login related operations")
user_ns = Namespace("user", description="user related operations")
users_ns = Namespace("user_actions", description="user actions related operations")


access = login_ns.model(
    "Access",
    {
        "username": fields.String("UserName", required=True),
        "password": fields.String(title="Password", default=""),
        "clear_session": fields.Boolean(title="clear_session", default=False),
        "otp": fields.String(title="otp", default=""),
    },
)

creation = login_ns.model(
    "Create",
    {
        "first_name": fields.String(title="Firstname", required=True),
        "last_name": fields.String(title="Lastname", required=True),
        "email": fields.String(title="Email", required=True),
        "password": fields.String(title="Password", required=True),
        "role": fields.String(title="Role", required=True),
        "status": fields.Boolean(title="Status", required=True),
    },
)

update_user = login_ns.model(
    "Update",
    {
        "email": fields.String(title="Email", required=True),
        "password": fields.String(title="Password", required=True),
        "otp": fields.Integer(title="otp", required=True),
    },
)

user_schema = UserSchema()
user_list_schema = UserSchema(many=True)


def CreateDefaultUser():
    user_json = {
        "first_name": "kits",
        "last_name": "admin",
        "email": "jafarp@pathbreakertech.com",
        "status": True,
        "password": "Kits@123",
        "role": "admin",
    }
    users_data = UserModel.find_by_email("jafarp@pathbreakertech.com")
    if users_data:
        print("User already in the database")
        return
    try:
        user_table_data = user_schema.load(user_json)
        user_table_data.save_to_db()
    except (Exception, exc.SQLAlchemyError) as e:
        logger.log(
            log_type="error",
            path="",
            cursor="INPUT-ERROR",
            message=str(e),
            uniqueId="",
        )
        return {"message": "Failed to save default user data into DB"}, 400
    print("user table set with default values")


class SendOTP(Resource):
    @login_ns.expect(access)
    @login_ns.doc("Login")
    def post(self):
        path = request.path
        try:
            access_ns_json = request.json
            username = access_ns_json["username"]
        except (Exception, exc.SQLAlchemyError) as e:
            logger.log(
                log_type="error",
                path=path,
                cursor="INPUT-ERROR",
                message=str(e),
                uniqueId="",
            )
            return {"message": "Input Request Error"}, 400
        try:
            user = UserModel.find_by_email(username)
        except (Exception, exc.SQLAlchemyError) as e:
            logger.log(
                log_type="error",
                path=path,
                cursor="INPUT-ERROR",
                message=str(e),
                uniqueId="",
            )
            return {"message": "User not registered yet, please contact admin"}, 500

        if not user:
            return {"message": "invalid username/email"}, 500

        if user.status == False:
            return {"message": "user not activated"}, 500

        if os.environ.get("ENVIRONMENT") in ["dev", "uat"]:
            otp = 123456
        else:
            otp = generate_otp()

        user.otp_sent_time = datetime.now()
        user.user_otp = otp

        try:
            user.save_to_db()
        except (Exception, exc.SQLAlchemyError) as e:
            logger.log(
                log_type="error",
                path=path,
                cursor="INPUT-ERROR",
                message=str(e),
                uniqueId="",
            )
            return {"message": "OTP saving failed"}, 400

        email_body = get_otp_email_template()

        try:
            send_mail(user.email, email_body.format(user.first_name, otp))
        except Exception as e:
            logger.log(
                log_type="error",
                path=path,
                cursor="INPUT-ERROR",
                message=str(e),
                uniqueId="",
            )
            return {"message": "OTP sent failed"}, 400

        return {"message": "OTP sent successfully."}, 201


class UserList(Resource):
    @users_ns.doc("get user by id")
    @jwt_required(fresh=True)
    def get(self, user_id):
        userId = current_user.user_id
        user_data = UserModel.find_by_id(userId)
        getjt = get_jwt()
        if float(getjt["signin_seconds"]) != user_data.last_logged_in.timestamp():
            return {
                "message": "Not a valid Authorization token, logout and login again",
                "error": "not_authorized",
            }, 401
        user_data = UserModel.find_by_id(id=user_id)
        if not user_data:
            return {"message": "user data not found"}, 400

        return (user_schema.dump(user_data), 200)


class UserRegister(Resource):
    @user_ns.doc("Get all the sponsers")
    def get(self):
        return (user_list_schema.dump(UserModel.find_all()), 200)

    @user_ns.expect(creation)
    @user_ns.doc("User")
    @jwt_required(fresh=True)
    def put(self):
        userId = current_user.user_id
        user_data = UserModel.find_by_id(userId)
        getjt = get_jwt()
        if float(getjt["signin_seconds"]) != user_data.last_logged_in.timestamp():
            return {
                "message": "Not a valid Authorization token, logout and login again",
                "error": "not_authorized",
            }, 401
        user_json = request.json
        try:
            user_data = UserModel.find_by_email(user_json["email"])
            if user_data:
                for key, value in user_json.items():
                    if hasattr(user_data, key) and value is not None:
                        setattr(user_data, key, value)
                user_data.save_to_db()
            else:
                return {"message": "user not found"}, 500
        except (Exception, exc.SQLAlchemyError) as e:
            print(str(e))
            return {"message": "user updation failed"}, 500
        return {"message": "user updation success"}, 200

    @user_ns.expect(creation)
    @user_ns.doc("User")
    def post(self):
        user_json = request.json
        try:
            user_data = UserModel.find_by_email(user_json["email"])
            if user_data:
                return {"message": "user already exists"}, 400
            user_data = user_schema.load(user_json)
            user_data.save_to_db()
        except (Exception, exc.SQLAlchemyError) as e:
            print(str(e))
            return {"message": "user creation failed"}, 400
        return {"message": "user registration success"}, 201

    @user_ns.expect(update_user)
    @user_ns.doc("User")
    def put(self):
        user_json = request.json
        try:
            user_data = UserModel.find_by_email(user_json["email"])
            if not user_data:
                return {"message": "invalid email, user not found"}, 500
            if user_data.user_otp != user_json["otp"]:
                return {"message": "invalid OTP"}, 500
            if user_data.status == False:
                return {"message": "user not activated"}, 500
            user_data.password = user_json["password"]
            user_data.save_to_db()
        except (Exception, exc.SQLAlchemyError) as e:
            print(str(e))
            return {"message": "password reset failed"}, 500
        return {"message": "password updated successfully"}, 200


class UserLogin(Resource):
    @login_ns.expect(access)
    @login_ns.doc("Login")
    def post(self):
        path = request.path
        logger.log(log_type="info", path=path, cursor="START", uniqueId="")
        try:
            access_ns_json = request.json
            username = access_ns_json["username"]
            password = access_ns_json["password"]
            clear_session = access_ns_json["clear_session"]
            if "otp" not in access_ns_json:
                return {"message": "OTP is required"}, 400
            otp = access_ns_json["otp"]
        except (Exception, exc.SQLAlchemyError) as e:
            logger.log(
                log_type="error",
                path=path,
                cursor="INPUT-ERROR",
                message=str(e),
                uniqueId="",
            )
            logger.log(log_type="info", path=path, cursor="END", uniqueId="")
            # abort(400,str(e))
            return {"message": "Input Request Error"}, 400

        # find user in database
        try:
            user = UserModel.find_by_email(username)
        except (Exception, exc.SQLAlchemyError) as e:
            logger.log(
                log_type="error",
                path=path,
                cursor="INPUT-ERROR",
                message=str(e),
                uniqueId="",
            )
            logger.log(log_type="info", path=path, cursor="END", uniqueId="")
            # abort(400, str(e))
            return {"message": "Error in Fetching User"}, 500

        if not user:
            return {"message": "User does not exist"}, 404

        if str(user.user_otp) != otp:
            return {"message": "invalid OTP"}, 400

        if str(user.password) != password:
            return {"message": "invalid password"}, 400

        if user.is_logged_in and clear_session == False:
            return {"message": "User already logged in"}, 409

        sent_time = user.otp_sent_time
        current_time = datetime.now()

        seconds = (current_time - sent_time).total_seconds()

        if int(seconds) > 120:
            return {"message": "OTP expired, please relogin"}, 400

        current_time = datetime.now()
        seconds = current_time.timestamp()
        additional_claims = {"signin_seconds": str(seconds)}
        access_token = create_access_token(
            identity=user.user_id, fresh=True, additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(
            user.user_id, additional_claims=additional_claims
        )

        user.access_token = access_token
        user.refresh_token = refresh_token
        user.is_logged_in = 1
        user.last_logged_in = datetime.now()
        try:
            user.save_to_db()
        except (Exception, exc.SQLAlchemyError) as e:
            logger.log(
                log_type="error",
                path=path,
                cursor="INPUT-ERROR",
                message=str(e),
                uniqueId="",
            )
            logger.log(log_type="info", path=path, cursor="END", uniqueId="")
            return {"message": "An ERROR occured while Updating details to DB"}, 500

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": user.role,
        }, 200


class TokenRefresh(Resource):
    @login_ns.doc("Token Refreshing")
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        current_time = datetime.now()
        seconds = current_time.timestamp()
        additional_claims = {"signin_seconds": str(seconds)}
        new_token = create_access_token(
            identity=current_user, fresh=True, additional_claims=additional_claims
        )
        return {"new_access_token": new_token}, 200