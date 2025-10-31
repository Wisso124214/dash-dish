import ldap3
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
        except ldap3.core.exceptions.LDAPBindError as e:
            # Handle connection errors
            print(f"Failed to bind to LDAP server: {e}")
            self.connection = None

    def get_user(self, email: str) -> LDAPUser | None:
        if not self.connection:
            return None

        search_filter = f'(mail={email})'
        
        try:
            self.connection.search(
                search_base=LDAP_SEARCH_BASE,
                search_filter=search_filter,
                attributes=['mail', 'userPassword', 'employeeType'] # Assuming 'employeeType' maps to role
            )

            if len(self.connection.entries) > 0:
                entry = self.connection.entries[0]
                user = LDAPUser(
                    email=entry.mail.value,
                    password=entry.userPassword.value,
                    role=entry.employeeType.value
                )
                return user
            else:
                return None
        except ldap3.core.exceptions.LDAPException as e:
            print(f"An LDAP error occurred: {e}")
            return None

    def __del__(self):
        if self.connection:
            self.connection.unbind()



