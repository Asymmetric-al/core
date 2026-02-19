import os
import sys

ROOT = os.path.dirname(os.path.dirname(__file__))
SITE = os.path.join(ROOT, 'site-packages')
LOCAL_HOME = os.path.join(ROOT, 'home')

os.makedirs(LOCAL_HOME, exist_ok=True)

# Force all Nia state into a writable workspace-local home.
os.environ['HOME'] = LOCAL_HOME
os.environ['USERPROFILE'] = LOCAL_HOME

# Clear proxy env vars that are blackholed in this environment.
for k in ('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','http_proxy','https_proxy','all_proxy','GIT_HTTP_PROXY','GIT_HTTPS_PROXY'):
    os.environ.pop(k, None)

if SITE not in sys.path:
    sys.path.insert(0, SITE)

from main import app

if __name__ == '__main__':
    app()