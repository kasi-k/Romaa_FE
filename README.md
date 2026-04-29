# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


1. If you don't have permissions to do the following changes, contact your AWS Administrator

2. Navigate to the S3 console at https://s3.console.aws.amazon.com/

3. Find and select the 'romaafiles' bucket from the list of buckets

4. Click on the 'Permissions' tab

5. Scroll down to the 'Cross-origin resource sharing (CORS)' section

6. Click on 'Edit' to modify the CORS configuration

7. Ensure the CORS configuration is in valid JSON format. The CORSRules should be an array. Here's a basic example structure:

   ```json
   {
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": []
       }
     ]
   }
   ```

8. Adjust the values within the array according to your specific CORS requirements

9. Click 'Save changes' to apply the new CORS configuration

10. If you encounter permission issues while saving, ensure you have the following permissions for the specific S3 bucket:

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:PutBucketCORS"
          ],
          "Resource": "arn:aws:s3:::romaafiles"
        }
      ]
    }
    ```

11. After saving, test your application to ensure the CORS configuration is working as expected