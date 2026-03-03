# Impostorcitos-backend

Backend para el juego impostorcitos.

## Local

```bash
npm install
```

## Servidor Linode


Secuencia de pasos para levantarlo en servidor
1. Actualizar paquetes del sistema
```bash
apt update && apt upgrade -y
```

2. Instalar Node LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs
```

3. Clonar proyecto, instalar dependencias y crear .env
```bash
git clone https://github.com/SantiagoIvan/impostorcitos-backend.git
cd impostorcitos-backend
npm i
echo "variables de entorno" > .env
```

4. Crear servicio de sistema
```bash
nano /etc/systemd/system/impostorcitos-backend.service

pegar lo siguiente

[Unit]
Description=Express Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/impostorcitos-backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

5. Registrar y activar servicio
```bash
systemctl daemon-reload
systemctl start impostorcitos-backend
systemctl enable impostorcitos-backend
```

6. Instalar NGINX
```bash
apt install nginx -y
systemctl status nginx
```

7. Configurar Reverse proxy
```bash
nano /etc/nginx/sites-available/api.impostorcitos.com

server {
    server_name api.impostorcitos.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

ln -s /etc/nginx/sites-available/impostorcitos-backend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

8. Certificados
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.impostorcitos.com
```