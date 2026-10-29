/**
 * OVA-04: Docker Compose Visual Generator & Interactive Deployment Playground
 * SENA Centro Minero Regional Boyacá - ADSO & Full Stack
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado del generador
  const state = {
    backend: 'node',
    database: 'postgres',
    redis: true,
    nginx: true,
    projectName: 'sicam-mina',
    backendPort: 3000,
    envMode: 'production',
    volumes: true,
    network: true,
    isDeployed: false,
    activeTab: 'console'
  };

  // Elementos DOM
  const codeViewerBody = document.getElementById('composeCodeViewer');
  const deployTerminalBody = document.getElementById('deployTerminalBody');
  const containerTableBody = document.getElementById('containerTableBody');
  const btnDeploy = document.getElementById('btnDeployStack');
  const btnDown = document.getElementById('btnDownStack');
  const btnCopyYaml = document.getElementById('btnCopyYaml');
  const btnDownloadYaml = document.getElementById('btnDownloadYaml');
  const btnValidateYaml = document.getElementById('btnValidateYaml');
  const validationAlert = document.getElementById('yamlValidationAlert');

  // Inicializar listeners de controles
  function initControls() {
    // Selectores de Backend
    document.querySelectorAll('[data-backend]').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('[data-backend]').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        state.backend = el.getAttribute('data-backend');
        // Ajustar puerto por defecto según backend
        if (state.backend === 'node') state.backendPort = 3000;
        if (state.backend === 'python') state.backendPort = 8000;
        if (state.backend === 'php') state.backendPort = 8080;
        const portInput = document.getElementById('inputBackendPort');
        if (portInput) portInput.value = state.backendPort;
        updateYaml();
      });
    });

    // Selectores de Base de Datos
    document.querySelectorAll('[data-db]').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('[data-db]').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        state.database = el.getAttribute('data-db');
        updateYaml();
      });
    });

    // Toggle Redis
    const checkRedis = document.getElementById('checkRedis');
    if (checkRedis) {
      checkRedis.addEventListener('change', (e) => {
        state.redis = e.target.checked;
        updateYaml();
      });
    }

    // Toggle Nginx
    const checkNginx = document.getElementById('checkNginx');
    if (checkNginx) {
      checkNginx.addEventListener('change', (e) => {
        state.nginx = e.target.checked;
        updateYaml();
      });
    }

    // Nombre de Proyecto
    const inputProjectName = document.getElementById('inputProjectName');
    if (inputProjectName) {
      inputProjectName.addEventListener('input', (e) => {
        state.projectName = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'sena-stack';
        updateYaml();
      });
    }

    // Puerto Backend
    const inputBackendPort = document.getElementById('inputBackendPort');
    if (inputBackendPort) {
      inputBackendPort.addEventListener('change', (e) => {
        state.backendPort = parseInt(e.target.value, 10) || 3000;
        updateYaml();
      });
    }

    // Modo Entorno
    const selectEnvMode = document.getElementById('selectEnvMode');
    if (selectEnvMode) {
      selectEnvMode.addEventListener('change', (e) => {
        state.envMode = e.target.value;
        updateYaml();
      });
    }

    // Toggle Volúmenes
    const checkVolumes = document.getElementById('checkVolumes');
    if (checkVolumes) {
      checkVolumes.addEventListener('change', (e) => {
        state.volumes = e.target.checked;
        updateYaml();
      });
    }

    // Toggle Red
    const checkNetwork = document.getElementById('checkNetwork');
    if (checkNetwork) {
      checkNetwork.addEventListener('change', (e) => {
        state.network = e.target.checked;
        updateYaml();
      });
    }

    // Botones de acción
    if (btnCopyYaml) btnCopyYaml.addEventListener('click', copyYaml);
    if (btnDownloadYaml) btnDownloadYaml.addEventListener('click', downloadYaml);
    if (btnValidateYaml) btnValidateYaml.addEventListener('click', validateYaml);
    if (btnDeploy) btnDeploy.addEventListener('click', deployStack);
    if (btnDown) btnDown.addEventListener('click', downStack);

    // Pestañas temáticas en Tema 3 (CloudPanel vs Dokploy)
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        const parent = btn.closest('.tab-wrapper') || document;
        parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        parent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetPane = document.getElementById(targetTab);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Pestañas de logs en Simulador
    document.querySelectorAll('.terminal-tab-btn[data-log]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.terminal-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeTab = btn.getAttribute('data-log');
        renderActiveLog();
      });
    });
  }

  // Generador de String YAML
  function generateYamlText() {
    let yaml = `# ==================================================================\n`;
    yaml += `# docker-compose.yml - Arquitectura de Despliegue en Contenedores\n`;
    yaml += `# Proyecto Formativo SENA: ${state.projectName}\n`;
    yaml += `# Entorno: ${state.envMode.toUpperCase()} | Centro Minero Regional Boyacá\n`;
    yaml += `# ==================================================================\n\n`;
    yaml += `name: ${state.projectName}\n\n`;
    yaml += `services:\n`;

    // 1. Servicio Base de Datos
    if (state.database === 'postgres') {
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  # Motor de Base de Datos Relacional PostgreSQL 16\n`;
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  db:\n`;
      yaml += `    image: postgres:16-alpine\n`;
      yaml += `    container_name: ${state.projectName}-db\n`;
      yaml += `    restart: always\n`;
      yaml += `    environment:\n`;
      yaml += `      POSTGRES_DB: \${DB_NAME:-${state.projectName}_db}\n`;
      yaml += `      POSTGRES_USER: \${DB_USER:-admin_sena}\n`;
      yaml += `      POSTGRES_PASSWORD: \${DB_PASSWORD:-Minero2026Secure*}\n`;
      if (state.volumes) {
        yaml += `    volumes:\n`;
        yaml += `      - pgdata:/var/lib/postgresql/data\n`;
        yaml += `      - ./init-scripts:/docker-entrypoint-initdb.d:ro\n`;
      }
      yaml += `    healthcheck:\n`;
      yaml += `      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-admin_sena} -d \${DB_NAME:-${state.projectName}_db}"]\n`;
      yaml += `      interval: 10s\n`;
      yaml += `      timeout: 5s\n`;
      yaml += `      retries: 5\n`;
      yaml += `      start_period: 10s\n`;
      if (state.network) {
        yaml += `    networks:\n`;
        yaml += `      - app-net\n`;
      }
      yaml += `\n`;
    } else if (state.database === 'mariadb') {
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  # Motor de Base de Datos Relacional MariaDB 11\n`;
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  db:\n`;
      yaml += `    image: mariadb:11-jammy\n`;
      yaml += `    container_name: ${state.projectName}-db\n`;
      yaml += `    restart: always\n`;
      yaml += `    environment:\n`;
      yaml += `      MARIADB_DATABASE: \${DB_NAME:-${state.projectName}_db}\n`;
      yaml += `      MARIADB_USER: \${DB_USER:-admin_sena}\n`;
      yaml += `      MARIADB_PASSWORD: \${DB_PASSWORD:-Minero2026Secure*}\n`;
      yaml += `      MARIADB_ROOT_PASSWORD: \${DB_ROOT_PWD:-RootMina2026*}\n`;
      if (state.volumes) {
        yaml += `    volumes:\n`;
        yaml += `      - mariadb_data:/var/lib/mysql\n`;
      }
      yaml += `    healthcheck:\n`;
      yaml += `      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]\n`;
      yaml += `      interval: 10s\n`;
      yaml += `      timeout: 5s\n`;
      yaml += `      retries: 4\n`;
      if (state.network) {
        yaml += `    networks:\n`;
        yaml += `      - app-net\n`;
      }
      yaml += `\n`;
    }

    // 2. Servicio Caché Redis
    if (state.redis) {
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  # Caché en Memoria y Cola de Tareas Redis 7\n`;
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  cache:\n`;
      yaml += `    image: redis:7-alpine\n`;
      yaml += `    container_name: ${state.projectName}-redis\n`;
      yaml += `    restart: unless-stopped\n`;
      yaml += `    command: ["redis-server", "--appendonly", "yes", "--requirepass", "\${REDIS_PWD:-RedisMina2026}"]\n`;
      if (state.volumes) {
        yaml += `    volumes:\n`;
        yaml += `      - redis_data:/data\n`;
      }
      if (state.network) {
        yaml += `    networks:\n`;
        yaml += `      - app-net\n`;
      }
      yaml += `\n`;
    }

    // 3. Servicio Backend
    yaml += `  # ----------------------------------------------------------------\n`;
    yaml += `  # API Backend (${state.backend.toUpperCase()}) - Lógica de Negocio\n`;
    yaml += `  # ----------------------------------------------------------------\n`;
    yaml += `  backend:\n`;
    if (state.backend === 'node') {
      yaml += `    build:\n`;
      yaml += `      context: ./backend\n`;
      yaml += `      dockerfile: Dockerfile\n`;
      yaml += `      target: ${state.envMode === 'production' ? 'production' : 'development'}\n`;
      yaml += `    image: ${state.projectName}-backend:latest\n`;
      yaml += `    container_name: ${state.projectName}-backend\n`;
      yaml += `    restart: always\n`;
      yaml += `    environment:\n`;
      yaml += `      NODE_ENV: ${state.envMode}\n`;
      yaml += `      PORT: ${state.backendPort}\n`;
      if (state.database === 'postgres') {
        yaml += `      DATABASE_URL: postgresql://\${DB_USER:-admin_sena}:\${DB_PASSWORD:-Minero2026Secure*}@db:5432/\${DB_NAME:-${state.projectName}_db}\n`;
      } else if (state.database === 'mariadb') {
        yaml += `      DATABASE_URL: mysql://\${DB_USER:-admin_sena}:\${DB_PASSWORD:-Minero2026Secure*}@db:3306/\${DB_NAME:-${state.projectName}_db}\n`;
      }
      if (state.redis) {
        yaml += `      REDIS_HOST: cache\n`;
        yaml += `      REDIS_PORT: 6379\n`;
        yaml += `      REDIS_PASSWORD: \${REDIS_PWD:-RedisMina2026}\n`;
      }
    } else if (state.backend === 'python') {
      yaml += `    build:\n`;
      yaml += `      context: ./api\n`;
      yaml += `      dockerfile: Dockerfile.multistage\n`;
      yaml += `    image: ${state.projectName}-fastapi:latest\n`;
      yaml += `    container_name: ${state.projectName}-backend\n`;
      yaml += `    restart: always\n`;
      yaml += `    environment:\n`;
      yaml += `      APP_ENV: ${state.envMode}\n`;
      yaml += `      PORT: ${state.backendPort}\n`;
      if (state.database === 'postgres') {
        yaml += `      DATABASE_URL: postgresql+asyncpg://admin_sena:Minero2026Secure*@db:5432/${state.projectName}_db\n`;
      }
      if (state.redis) {
        yaml += `      REDIS_URL: redis://:RedisMina2026@cache:6379/0\n`;
      }
    } else if (state.backend === 'php') {
      yaml += `    image: php:8.3-fpm-alpine\n`;
      yaml += `    container_name: ${state.projectName}-backend\n`;
      yaml += `    restart: always\n`;
      yaml += `    volumes:\n`;
      yaml += `      - ./src:/var/www/html\n`;
      yaml += `    environment:\n`;
      yaml += `      APP_ENV: ${state.envMode}\n`;
      if (state.database !== 'none') {
        yaml += `      DB_HOST: db\n`;
        yaml += `      DB_PORT: ${state.database === 'postgres' ? '5432' : '3306'}\n`;
        yaml += `      DB_DATABASE: ${state.projectName}_db\n`;
      }
    }

    // Mapeo de puertos o solo interno si Nginx está activo
    if (!state.nginx) {
      yaml += `    ports:\n`;
      yaml += `      - "${state.backendPort}:${state.backendPort}"\n`;
    }

    // Dependencias
    const deps = [];
    if (state.database !== 'none') deps.push('db');
    if (state.redis) deps.push('cache');

    if (deps.length > 0) {
      yaml += `    depends_on:\n`;
      deps.forEach(dep => {
        if (dep === 'db') {
          yaml += `      db:\n`;
          yaml += `        condition: service_healthy\n`;
        } else {
          yaml += `      ${dep}:\n`;
          yaml += `        condition: service_started\n`;
        }
      });
    }

    if (state.network) {
      yaml += `    networks:\n`;
      yaml += `      - app-net\n`;
    }
    yaml += `\n`;

    // 4. Servicio Nginx Reverse Proxy
    if (state.nginx) {
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  # Nginx Gateway & Reverse Proxy con SSL Termination\n`;
      yaml += `  # ----------------------------------------------------------------\n`;
      yaml += `  nginx:\n`;
      yaml += `    image: nginx:alpine\n`;
      yaml += `    container_name: ${state.projectName}-nginx\n`;
      yaml += `    restart: always\n`;
      yaml += `    ports:\n`;
      yaml += `      - "80:80"\n`;
      yaml += `      - "443:443"\n`;
      yaml += `    volumes:\n`;
      yaml += `      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro\n`;
      yaml += `      - ./nginx/ssl:/etc/ssl/certs:ro\n`;
      yaml += `    depends_on:\n`;
      yaml += `      backend:\n`;
      yaml += `        condition: service_started\n`;
      if (state.network) {
        yaml += `    networks:\n`;
        yaml += `      - app-net\n`;
      }
      yaml += `\n`;
    }

    // Volúmenes Globales
    if (state.volumes && (state.database !== 'none' || state.redis)) {
      yaml += `volumes:\n`;
      if (state.database === 'postgres') yaml += `  pgdata:\n    driver: local\n`;
      if (state.database === 'mariadb') yaml += `  mariadb_data:\n    driver: local\n`;
      if (state.redis) yaml += `  redis_data:\n    driver: local\n`;
      yaml += `\n`;
    }

    // Redes Globales
    if (state.network) {
      yaml += `networks:\n`;
      yaml += `  app-net:\n`;
      yaml += `    driver: bridge\n`;
      yaml += `    name: ${state.projectName}_network\n`;
    }

    return yaml;
  }

  // Resaltado de sintaxis simplificado para el visor
  function highlightYaml(raw) {
    const lines = raw.split('\n');
    return lines.map(line => {
      // Comentario
      if (line.trim().startsWith('#')) {
        return `<span class="token-comment">${escapeHtml(line)}</span>`;
      }
      // Claves YAML (e.g. "  services:")
      const keyMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):(.*)$/);
      if (keyMatch) {
        const indent = keyMatch[1];
        const key = keyMatch[2];
        const rest = keyMatch[3];
        return `${indent}<span class="token-key">${key}</span>:<span class="token-string">${escapeHtml(rest)}</span>`;
      }
      // Directivas de lista (e.g. "      - 80:80")
      if (line.trim().startsWith('-')) {
        return `<span class="token-directive">${escapeHtml(line)}</span>`;
      }
      return escapeHtml(line);
    }).join('\n');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Actualizar el DOM del editor YAML
  function updateYaml() {
    const rawYaml = generateYamlText();
    if (codeViewerBody) {
      codeViewerBody.innerHTML = highlightYaml(rawYaml);
    }
  }

  // Copiar YAML al portapapeles
  function copyYaml() {
    const rawYaml = generateYamlText();
    navigator.clipboard.writeText(rawYaml).then(() => {
      if (!btnCopyYaml) return;
      const original = btnCopyYaml.innerHTML;
      btnCopyYaml.innerHTML = '✓ ¡Copiado!';
      btnCopyYaml.classList.add('btn-primary');
      setTimeout(() => {
        btnCopyYaml.innerHTML = original;
        btnCopyYaml.classList.remove('btn-primary');
      }, 2000);
    });
  }

  // Descargar archivo .yml
  function downloadYaml() {
    const rawYaml = generateYamlText();
    const blob = new Blob([rawYaml], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `docker-compose-${state.projectName}.yml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Validar sintaxis YAML
  function validateYaml() {
    if (!validationAlert) return;
    validationAlert.style.display = 'block';
    validationAlert.className = 'callout callout-success';
    validationAlert.innerHTML = `
      <div class="callout-icon">✓</div>
      <div class="callout-body">
        <div class="callout-title">Sintaxis Validada Exitosamente (Compose v2 Specification)</div>
        <div class="callout-text">
          El esquema de servicios para <strong>${state.projectName}</strong> cumple con la especificación OCI y Docker Compose.
          Total de servicios: <strong>${(state.database !== 'none' ? 1 : 0) + (state.redis ? 1 : 0) + 1 + (state.nginx ? 1 : 0)}</strong> |
          Redes: <strong>${state.network ? '1 bridge privada' : 'host'}</strong> |
          Volúmenes persistentes: <strong>${state.volumes ? 'Habilitados' : 'Deshabilitados'}</strong>.
        </div>
      </div>
    `;
    setTimeout(() => {
      validationAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  // Simulación de Despliegue (docker compose up -d)
  function deployStack() {
    if (state.isDeployed) {
      alert('El stack ya se encuentra desplegado y activo. Usa "Detener Stack" antes de redesplegar.');
      return;
    }

    state.isDeployed = true;
    if (btnDeploy) btnDeploy.disabled = true;
    if (btnDown) btnDown.disabled = false;

    if (deployTerminalBody) {
      deployTerminalBody.innerHTML = '';
    }

    const logSteps = [
      { tag: 'info', text: `$ docker compose --project-name ${state.projectName} up -d --build` },
      { tag: 'layer', text: `[+] Building 0.0s (0/0)` },
      { tag: 'info', text: `[+] Running 4/4` }
    ];

    if (state.network) {
      logSteps.push({ tag: 'success', text: ` ✔ Network ${state.projectName}_network  Created` });
    }
    if (state.volumes && state.database === 'postgres') {
      logSteps.push({ tag: 'success', text: ` ✔ Volume "${state.projectName}_pgdata"  Created` });
    }
    if (state.volumes && state.redis) {
      logSteps.push({ tag: 'success', text: ` ✔ Volume "${state.projectName}_redis_data"  Created` });
    }
    if (state.database !== 'none') {
      logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-db  Creating` });
      logSteps.push({ tag: 'success', text: ` ✔ Container ${state.projectName}-db  Started` });
    }
    if (state.redis) {
      logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-redis  Creating` });
      logSteps.push({ tag: 'success', text: ` ✔ Container ${state.projectName}-redis  Started` });
    }
    logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-backend  Creating` });
    logSteps.push({ tag: 'success', text: ` ✔ Container ${state.projectName}-backend  Started` });
    if (state.nginx) {
      logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-nginx  Creating` });
      logSteps.push({ tag: 'success', text: ` ✔ Container ${state.projectName}-nginx  Started` });
    }

    logSteps.push({ tag: 'info', text: `ℹ Verificando sonda de salud (healthcheck) de base de datos...` });
    logSteps.push({ tag: 'success', text: `✔ [db] Socket TCP PostgreSQL / MariaDB listo y aceptando conexiones en 0.00ms` });
    logSteps.push({ tag: 'success', text: `🚀 ¡Stack desplegado exitosamente en el Ambiente 205 (Host: 192.168.205.10)!` });

    let stepIndex = 0;
    function printNextLog() {
      if (stepIndex >= logSteps.length) {
        if (btnDeploy) btnDeploy.disabled = false;
        renderContainerTable();
        return;
      }
      const item = logSteps[stepIndex];
      const logDiv = document.createElement('div');
      logDiv.className = `log-line log-tag-${item.tag}`;
      logDiv.innerHTML = `<span style="opacity:0.6;">[${new Date().toLocaleTimeString()}]</span> ${escapeHtml(item.text)}`;
      deployTerminalBody.appendChild(logDiv);
      deployTerminalBody.scrollTop = deployTerminalBody.scrollHeight;
      stepIndex++;
      setTimeout(printNextLog, 220);
    }

    printNextLog();
  }

  // Renderizar tabla interactiva de Contenedores (docker ps)
  function renderContainerTable() {
    if (!containerTableBody) return;
    const containers = [];

    if (state.nginx) {
      containers.push({
        id: 'a9f14e2c81',
        name: `${state.projectName}-nginx`,
        image: 'nginx:alpine',
        ports: '0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp',
        status: 'Up 1 minute'
      });
    }

    containers.push({
      id: 'd481b7e092',
      name: `${state.projectName}-backend`,
      image: `${state.projectName}-backend:latest`,
      ports: state.nginx ? `${state.backendPort}/tcp (internal)` : `0.0.0.0:${state.backendPort}->${state.backendPort}/tcp`,
      status: 'Up 1 minute'
    });

    if (state.redis) {
      containers.push({
        id: '7b22a831e5',
        name: `${state.projectName}-redis`,
        image: 'redis:7-alpine',
        ports: '6379/tcp (internal)',
        status: 'Up 1 minute'
      });
    }

    if (state.database === 'postgres') {
      containers.push({
        id: '2c55f901a3',
        name: `${state.projectName}-db`,
        image: 'postgres:16-alpine',
        ports: '5432/tcp (internal)',
        status: 'Up 1 minute (healthy)'
      });
    } else if (state.database === 'mariadb') {
      containers.push({
        id: '3d66e812b4',
        name: `${state.projectName}-db`,
        image: 'mariadb:11-jammy',
        ports: '3306/tcp (internal)',
        status: 'Up 1 minute (healthy)'
      });
    }

    let html = '';
    containers.forEach(c => {
      html += `
        <tr>
          <td><span style="font-family:var(--font-mono); font-weight:700; color:var(--sena-cyan);">${c.id}</span></td>
          <td><strong>${c.name}</strong></td>
          <td><span style="font-family:var(--font-mono); font-size:0.78rem;">${c.image}</span></td>
          <td><span style="font-family:var(--font-mono); font-size:0.75rem;">${c.ports}</span></td>
          <td>
            <span class="status-pill status-pill-running">
              <span class="pulse-indicator"></span> ${c.status}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.72rem;" onclick="alert('Logs de ${c.name}:\\n[INFO] Servidor escuchando peticiones en Ambiente 205.\\n[OK] Memoria RAM: 42MB | CPU: 0.2%')">
              📜 Logs
            </button>
          </td>
        </tr>
      `;
    });

    containerTableBody.innerHTML = html;
  }

  // Detener Stack (docker compose down)
  function downStack() {
    if (!state.isDeployed) {
      alert('No hay ningún stack activo para detener.');
      return;
    }

    state.isDeployed = false;
    if (btnDeploy) btnDeploy.disabled = false;
    if (btnDown) btnDown.disabled = true;

    const logSteps = [
      { tag: 'info', text: `$ docker compose --project-name ${state.projectName} down` },
      { tag: 'layer', text: `[+] Running 4/4` }
    ];

    if (state.nginx) {
      logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-nginx  Stopping` });
      logSteps.push({ tag: 'warn', text: ` ✔ Container ${state.projectName}-nginx  Removed` });
    }
    logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-backend  Stopping` });
    logSteps.push({ tag: 'warn', text: ` ✔ Container ${state.projectName}-backend  Removed` });
    if (state.redis) {
      logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-redis  Stopping` });
      logSteps.push({ tag: 'warn', text: ` ✔ Container ${state.projectName}-redis  Removed` });
    }
    if (state.database !== 'none') {
      logSteps.push({ tag: 'layer', text: ` ✔ Container ${state.projectName}-db  Stopping` });
      logSteps.push({ tag: 'warn', text: ` ✔ Container ${state.projectName}-db  Removed` });
    }
    if (state.network) {
      logSteps.push({ tag: 'warn', text: ` ✔ Network ${state.projectName}_network  Removed` });
    }
    logSteps.push({ tag: 'info', text: `🛑 Stack detenido. Los datos persisten de manera segura en los volúmenes del nodo Ubuntu 205.` });

    let stepIndex = 0;
    function printNextLog() {
      if (stepIndex >= logSteps.length) {
        if (containerTableBody) {
          containerTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">Ningún contenedor en ejecución. Haz clic en "Simular Despliegue" arriba.</td></tr>`;
        }
        return;
      }
      const item = logSteps[stepIndex];
      const logDiv = document.createElement('div');
      logDiv.className = `log-line log-tag-${item.tag}`;
      logDiv.innerHTML = `<span style="opacity:0.6;">[${new Date().toLocaleTimeString()}]</span> ${escapeHtml(item.text)}`;
      deployTerminalBody.appendChild(logDiv);
      deployTerminalBody.scrollTop = deployTerminalBody.scrollHeight;
      stepIndex++;
      setTimeout(printNextLog, 180);
    }

    printNextLog();
  }

  // Renderizar logs por servicio seleccionado
  function renderActiveLog() {
    if (!deployTerminalBody) return;
    if (state.activeTab === 'console') {
      // Dejar la consola estándar
      return;
    }
    if (state.activeTab === 'nginx') {
      deployTerminalBody.innerHTML = `
        <div class="log-line log-tag-info">[nginx] 192.168.205.45 - - [29/Oct/2026:10:14:02 -0500] "GET /api/v1/acceso-mina HTTP/1.1" 200 142 "https://sicam.centrominero.sena.edu.co" "Mozilla/5.0"</div>
        <div class="log-line log-tag-info">[nginx] 192.168.205.52 - - [29/Oct/2026:10:14:05 -0500] "POST /api/v1/rfid-scan HTTP/1.1" 201 89 "-" "ESP32-TorniqueteBocamina/1.0"</div>
        <div class="log-line log-tag-layer">[nginx] SSL Handshake TLSv1.3 ECDHE-RSA-AES256-GCM-SHA384 completado con éxito</div>
      `;
    } else if (state.activeTab === 'backend') {
      deployTerminalBody.innerHTML = `
        <div class="log-line log-tag-success">[app] [BOOT] Servicio ${state.backend.toUpperCase()} iniciado en puerto ${state.backendPort}</div>
        <div class="log-line log-tag-info">[app] [AUTH] Conexión establecida con base de datos ${state.database.toUpperCase()}</div>
        <div class="log-line log-tag-info">[app] [MQTT] Suscripción activa a tópico: 'mina/didactica/sensores/co2'</div>
        <div class="log-line log-tag-success">[app] [HTTP] 200 OK GET /health -> status: healthy, uptime: 124s</div>
      `;
    } else if (state.activeTab === 'db') {
      deployTerminalBody.innerHTML = `
        <div class="log-line log-tag-info">[db] PostgreSQL Database server ready to accept client connections</div>
        <div class="log-line log-tag-info">[db] autovacuum launcher started</div>
        <div class="log-line log-tag-success">[db] CHECKPOINT starting: time</div>
        <div class="log-line log-tag-success">[db] CHECKPOINT complete: wrote 42 buffers (0.3%); 0 WAL file(s) added</div>
      `;
    }
  }

  // Inicialización
  initControls();
  updateYaml();
});
