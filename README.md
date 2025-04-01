To run this cloned **ICP project** through GitHub, follow these steps:  

### **1. Clone the Repository**  
```bash
git clone https://github.com/Chakri7reddy/freelance
cd freelance
```

### **2. Install DFX (if not installed)**  
```bash
dfx --version || sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

### **3. Start the ICP Local Replica**  
```bash
dfx start --background
```

### **4. Deploy the Backend Canisters**  
```bash
dfx deploy
```

### **5. Install Dependencies & Start Frontend**  
```bash
cd frontend
npm install  # or pnpm install
npm run dev  # or npm start
```

Now, open **localhost** in your browser to access the app. 🚀


and for live which is deployed on mainnet use this link then login with internet identity(else create new identity)



For Frontend :  https://ihjrj-4aaaa-aaaae-qczla-cai.icp0.io/


For Backend: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=iok2v-kiaaa-aaaae-qczkq-cai
