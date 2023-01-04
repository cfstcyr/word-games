FROM node:19 as dev
WORKDIR /app
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV development
CMD ["npm", "start"]

FROM node:19 as builder
ARG SERVER_URL
WORKDIR /app
ENV REACT_APP_SERVER_URL=${SERVER_URL}
COPY package*.json ./
RUN npm ci --silent
COPY . ./
RUN npm run build

FROM nginx:stable-alpine as prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]