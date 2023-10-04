import os
import platform

if (len(os.sys.argv) > 1 and os.sys.argv[1] != "prod"):
    print("Invalid argument: usage start.py <prod>")
    exit(1)

mode = "production" if len(os.sys.argv) > 1 and os.sys.argv[1] == "prod" else "development"

os.system("cd SquealerSMMDashboard && npm run build")

if(mode != "development"):
    os.system("cd SquealerApp && npm run build")

    print("Starting in production mode...")
    if(platform.system() == "Linux"):
        os.system("NODE_ENV=\"production\" node index.js")
    elif (platform.system() == "Windows"):
        os.system("set NODE_ENV=\"production\" && node index.js")
    else:
        print("Os not supported")
        exit(1)
else:
    print("Starting in development mode...")
    os.system("node index.js")