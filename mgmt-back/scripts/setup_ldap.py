import ldap3
from ldap3.utils.hashed import hashed
from ldap3.core.exceptions import LDAPException, LDAPObjectClassError
import os
from dotenv import load_dotenv

# Load environment variables from ../.env
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# --- Configuration ---
LDAP_SERVER_HOST = 'localhost'  # Since we exposed the port
LDAP_SERVER_PORT = 389
LDAP_ADMIN_DN = os.getenv('LDAP_USER_DN')
LDAP_ADMIN_PASSWORD = os.getenv('LDAP_PASSWORD')
BASE_DN = os.getenv('LDAP_BASE_DN')

# --- Data to be added ---
OUS = ['users', 'groups']
USERS = [
    {
        "email": "kitchen@superrestaurant.com",
        "password": "1234",
        "role": "kitchen",
        "cn": "kitchen_user"
    },
    {
        "email": "register@superrestaurant.com",
        "password": "1234",
        "role": "register",
        "cn": "register_user"
    },
    {
        "email": "admin@superrestaurant.com",
        "password": "1234",
        "role": "admin",
        "cn": "admin_user"
    }
]

def setup_ldap():
    """Connects to LDAP and sets up OUs and users."""
    if not all([LDAP_ADMIN_DN, LDAP_ADMIN_PASSWORD, BASE_DN]):
        print("Error: Missing LDAP environment variables. Check your .env file.")
        return

    server = ldap3.Server(LDAP_SERVER_HOST, port=LDAP_SERVER_PORT, get_info=ldap3.ALL)
    try:
        conn = ldap3.Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASSWORD, auto_bind=True)
        print("Successfully connected to LDAP server.")
    except LDAPException as e:
        print(f"Failed to connect to LDAP: {e}")
        return

    # --- Create Organizational Units (OUs) ---
    for ou_name in OUS:
        ou_dn = f"ou={ou_name},{BASE_DN}"
        try:
            conn.add(ou_dn, 'organizationalUnit')
            if conn.result['result'] == 0:
                print(f"Successfully created OU: {ou_dn}")
            elif conn.result['result'] == 68: # Already exists
                print(f"OU already exists: {ou_dn}")
        except LDAPObjectClassError:
             print(f"OU already exists: {ou_dn}")
        except LDAPException as e:
            print(f"Error creating OU {ou_dn}: {e}")

    # --- Create Users ---
    users_ou_dn = f"ou=users,{BASE_DN}"
    for user in USERS:
        user_dn = f"cn={user['cn']},{users_ou_dn}"
        hashed_password = hashed(ldap3.HASHED_SALTED_SHA, user['password'].encode('utf-8'))
        
        attributes = {
            'objectClass': ['inetOrgPerson', 'organizationalPerson', 'person', 'top'],
            'cn': user['cn'],
            'sn': user['cn'].split('_')[0],  # Last name
            'mail': user['email'],
            'employeeType': user['role'],
            'userPassword': hashed_password
        }
        
        try:
            conn.add(user_dn, attributes=attributes)
            if conn.result['result'] == 0:
                print(f"Successfully created user: {user['email']}")
            elif conn.result['result'] == 68: # Already exists
                print(f"User already exists: {user['email']}")
        except LDAPException as e:
            print(f"Error creating user {user['email']}: {e}")

    conn.unbind()
    print("LDAP setup complete.")

if __name__ == "__main__":
    setup_ldap()