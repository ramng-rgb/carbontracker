FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom configuration for Cloud Run
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy static website files to nginx html folder
COPY . /usr/share/nginx/html

# Port 8080 exposed (Cloud Run default)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
