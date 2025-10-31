import ldap3
from ldap3.core.exceptions import LDAPBindError, LDAPException
from .models import LDAPUser
from dotenv import load_dotenv
import os

load_dotenv()

# This is a placeholder for a real configuration.
# In a real application, these values should be stored in a configuration file.
LDAP_SERVER = os.getenv('LDAP_SERVER', 'ldap://localhost')
LDAP_PORT = int(os.getenv('LDAP_PORT', 389))
LDAP_ADMIN_USER = os.getenv('LDAP_ADMIN_USER', 'cn=admin,dc=example,dc=org')
LDAP_ADMIN_PASSWORD = os.getenv('LDAP_ADMIN_PASSWORD', 'admin_password')
LDAP_SEARCH_BASE = os.getenv('LDAP_SEARCH_BASE', 'ou=users,dc=example,dc=org')

class LDAPDatabase:
    def __init__(self):
        self.server = ldap3.Server(LDAP_SERVER, port=LDAP_PORT, get_info=ldap3.ALL)
        try:
            self.connection = ldap3.Connection(self.server, user=LDAP_ADMIN_USER, password=LDAP_ADMIN_PASSWORD, auto_bind=True)
        except LDAPBindError as e:
            # Handle connection errors
            print(f"Failed to bind to LDAP server: {e}")
            self.connection = None

    def authenticate(self, email: str, password: str) -> LDAPUser | None:
        """Authenticate a user by email and password using LDAP bind."""
        if not self.connection:
            return None

        search_filter = f'(mail={email})'
        
        try:
            # First, search for the user to get their DN
            self.connection.search(
                search_base=LDAP_SEARCH_BASE,
                search_filter=search_filter,
                attributes=['mail', 'employeeType']  # Don't retrieve password for security
            )

            if len(self.connection.entries) == 0:
                return None

            user_dn = self.connection.entries[0].entry_dn
            role = self.connection.entries[0].employeeType.value

            # Now, try to bind with the user's DN and provided password
            user_connection = ldap3.Connection(self.server, user=user_dn, password=password, auto_bind=True)
            user_connection.unbind()  # Close the connection after successful bind

            # If bind succeeded, return the user (without password)
            return LDAPUser(email=email, password="", role=role)

        except LDAPBindError:
            # Authentication failed
            return None
        except LDAPException as e:
            print(f"An LDAP error occurred during authentication: {e}")
            return None

    def __del__(self):
        if self.connection:
            self.connection.unbind()



