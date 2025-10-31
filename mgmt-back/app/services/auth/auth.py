from ...database.ldap import LDAPDatabase
from ..session.session import SessionService
from typing import Optional
from app.lib.types.http import SessionData, LoginResponse


class AuthService:
    def __init__(self):
        self.ldap_db = LDAPDatabase()
        self.session_service = SessionService()

    def login(self, email: str, password: str) -> Optional[LoginResponse]:
        """
        Authenticate user with LDAP and create a session.
        Returns session_id if successful, None otherwise.
        """
        user = self.ldap_db.authenticate(email, password)
        if user:
            # Create session with user data (excluding password)
            session_data = SessionData(email=user.email, role=user.role)
            session_id = self.session_service.create_session(session_data)
            return LoginResponse(session_id=session_id, role=user.role)
        return None

    def logout(self, session_id: str) -> bool:
        """Delete the session."""
        return self.session_service.delete_session(session_id)

    def get_current_user(self, session_id: str) -> Optional[SessionData]:
        """Get user data from session."""
        return self.session_service.get_session(session_id)
