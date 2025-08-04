# Sharkbook: AI-Powered design to code platform in the Browser

## Requirements
- Node.js (v20 or higher)
- Remix (v2.0.0 or higher)
- Cloudflare Workers (v4.0.0 or higher)
- pnpm (v8.0.0 or higher)
  
## Installation
To get started with Sharkbook, follow these steps:
1. Clone the repository:
   ```bash
   git clone xxx
   ```
2. Navigate to the project directory:
   ```bash
   cd beaver-ai
   ```
3. Install the dependencies using pnpm:
   ```bash
   pnpm install
   ```
4. Set up the environment variables:    
   Create a `.env` file in the root directory and add the following variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   CLOUDINARY_URL=your_cloudinary_url
   ```
5. Start the development server:
   ```bash
   pnpm run dev
   ```
6. Open your browser and navigate to `http://localhost:5173` to see the application in action.

## Features
- AI-powered design to code conversion
- Seamless integration with Cloudflare Workers
- Support for Remix framework
- Easy deployment with pnpm
- Unocss

### cloudflare local enviroment variables

To run the project locally, you need to set up the following environment variables in a `.env` file:

```
// wrangler.toml
[vars]
secret_key = "your_secret_key
```


## Deployment
To deploy the project, you can use the following command:

```
pnpm run deploy
```

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing
We welcome contributions to Sharkbook! If you have suggestions or improvements, please open an issue or submit a pull request.

## Contact
For any questions or inquiries, please contact us at bazingaedward@gmail.com
