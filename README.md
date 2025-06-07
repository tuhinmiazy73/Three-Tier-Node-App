**Three-Tier-Node-App-For-ToDoList**

**Features:**

	Add, delete, and view TODO items

	Express.js for the backend

	HTML + CSS + Bootstrap for a clean UI

	Stores data in SQLite

![Three Tier ToDoList Node App Diagram](https://github.com/user-attachments/assets/9051eed2-66b6-448d-954a-5121e3c4748f)



**🛠 Setup Instructions (for Red Hat Linux):**

**1. Clone the repository**

 	#git clone https://github.com/tuhinmiazy73/Three-Tier-Node-App.git
  
**2. Install Node.js and SQLite:**
   
	  #yum module install nodejs:18
   
	  #yum install sqlite
   
**4. Change directory to the app directory**
   
	  #cd Three-Tier-Node-App
   
**5. Install dependencies:**
   
	  #npm install
   
**6. Run the app:**
   
	  #npm start
   
**7. Open in your browser:**
	  http://your-ip:3000
   
![image](https://github.com/user-attachments/assets/ac270535-f5f8-49fd-b47e-f92604b02bd5)

![image](https://github.com/user-attachments/assets/993c5609-7665-4de6-9a8e-c700f1bd5e07)

=============================================
Adding Vault with Jenkins
=============================================

✅ 1. Store Secrets in Vault
Download and install Vault on your server, then initialize and unseal it.

Store your Docker Hub credentials as a key-value secret :

	#vault kv put secret/data/docker-user-cred username="your-docker-username" password="your-docker-password"
 
📌 This stores credentials at secret/data/docker-user-cred.

✅ 2. Configure Vault Plugin in Jenkins
Install the HashiCorp Vault plugin from Jenkins Plugin Manager. Then configure it globally:

Jenkins → Manage Jenkins → Configure System. Find "Vault" section.

Set:
Vault URL (e.g., http://127.0.0.1:8200)
Vault credentials: (choose one below)

⚙️ Token-based (simple for dev):
Create a Jenkins credential of type Vault Token, then use it here.

🔐 AppRole / AWS IAM Auth (preferred for production):
Use Vault’s AppRole or AWS IAM method and map Jenkins agent to a Vault role. Enable the AppRole authentication method:
	
 	#export VAULT_ADDR='https://public-ip:8200'
	#vault login <your-root-token>
	#vault auth enable approle
	#vault write auth/approle/role/jenkins-role token_num_uses=0 secret_id_num_uses=0 policies="jenkins"
 	#vault read auth/approle/role/jenkins-role/role-id
  	#vault write -f auth/approle/role/jenkins-role/secret-id
	#scp /opt/vault/tls/tls.crt jenkins-user@<jenkins-ip>:/tmp/vault.crt
 
⚙️ Import Certificate into Jenkins' Java Truststore

 	#readlink -f $(which java)
 	#sudo keytool -import -alias vault -file /tmp/vault.crt -keystore /usr/lib/jvm/java-17-openjdk-amd64/lib/security/cacerts
   	#systemctl restart jenkins
    
✅ 3. Create Jenkins credentials from the Vault Secret. You now need to map Vault secrets to Jenkins credentials.

Go to: Jenkins → Credentials → (your store/domain) → Add Credentials

Choose:

Kind: Vault Username and Password

Credential ID: docker-hub-vault-creds (used in your pipeline)

Path: secret/data/docker-user-cred

Username Key: username

Password Key: password

This will fetch those keys (username and password) from Vault’s secret/data/docker-user-cred. Now create the pipeline and run it.
