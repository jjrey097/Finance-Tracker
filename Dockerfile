# Stage 1: Build the Vue frontend
FROM node:20-alpine AS vue-build
WORKDIR /src/Client
COPY Client/package*.json ./
RUN npm ci
COPY Client/ ./
# VITE_CLERK_PUBLISHABLE_KEY must be passed as a build arg so Vite can embed it
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build
# Output lands at /src/wwwroot (outDir: '../wwwroot' in vite.config.js)

# Stage 2: Build the .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /src
COPY FinanceTracker.Api.csproj .
RUN dotnet restore
COPY . .
# Overlay the Vue build output before publishing
COPY --from=vue-build /src/wwwroot ./wwwroot
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=dotnet-build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "FinanceTracker.Api.dll"]
