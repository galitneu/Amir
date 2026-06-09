# Amir Memorial Tribute Website
        
As a web designer, create a detailed plan for a memorial website dedicated to Amir. The website should include sections for a biography, photos, memories from family and friends, and a place for visitors to leave messages or tributes. Consider using a respectful and elegant design that reflects the individual's life and achievements. Outline the content and features for each section, and suggest color schemes and fonts that convey a sense of remembrance and honor.


Made with Floot.

# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, download your database content as a pg_dump from the cog icon in the database view (right pane -> data -> floot data base -> cog icon on the left of the name), upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
