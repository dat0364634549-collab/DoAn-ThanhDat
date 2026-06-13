FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY server/server.csproj server/
RUN dotnet restore server/server.csproj

COPY . .
RUN dotnet publish server/server.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app/server
COPY --from=build /app/publish .
COPY images /app/images

EXPOSE 10000
ENTRYPOINT ["dotnet", "server.dll"]
