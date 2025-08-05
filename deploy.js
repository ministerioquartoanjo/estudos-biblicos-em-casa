const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const DOMAIN = 'estudoscasa.advertenciafinal.com';
const PROJECT_PATH = __dirname;

console.log('🚀 Iniciando o processo de publicação...\n');

// Verificar se o surge está instalado
try {
    execSync('surge --version', { stdio: 'ignore' });
} catch (error) {
    console.error('❌ O Surge.sh não está instalado. Por favor, instale com:');
    console.log('npm install --global surge\n');
    process.exit(1);
}

// Criar um arquivo CNAME para o domínio personalizado
fs.writeFileSync(path.join(PROJECT_PATH, 'CNAME'), DOMAIN);

console.log('📂 Estrutura de arquivos verificada');

// Publicar no surge.sh
console.log('🚀 Publicando no Surge.sh...\n');

try {
    execSync(`surge ${PROJECT_PATH} ${DOMAIN}`, { stdio: 'inherit' });
    
    console.log('\n✅ Publicação concluída com sucesso!');
    console.log(`🌐 Acesse: https://${DOMAIN}`);
    
    // Remover o arquivo CNAME após a publicação
    if (fs.existsSync(path.join(PROJECT_PATH, 'CNAME'))) {
        fs.unlinkSync(path.join(PROJECT_PATH, 'CNAME'));
    }
    
} catch (error) {
    console.error('\n❌ Ocorreu um erro durante a publicação:');
    console.error(error.message);
    
    // Remover o arquivo CNAME em caso de erro
    if (fs.existsSync(path.join(PROJECT_PATH, 'CNAME'))) {
        fs.unlinkSync(path.join(PROJECT_PATH, 'CNAME'));
    }
    
    process.exit(1);
}
