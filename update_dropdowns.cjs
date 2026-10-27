const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Make dropdown container bigger and more modern
            if (content.includes("w-56 bg-white rounded-xl shadow-2xl")) {
                content = content.replace(/w-56 bg-white rounded-xl shadow-2xl border border-slate-200 ring-1 ring-black ring-opacity-5 z-20 transition-all font-sans text-left overflow-hidden/g, "w-[240px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 ring-1 ring-black/5 z-50 transition-all font-sans text-left overflow-hidden py-1");
                modified = true;
            }
            if (content.includes("w-48 bg-white rounded-lg shadow-lg")) {
                content = content.replace(/w-48 bg-white rounded-lg shadow-lg/g, "w-[240px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden py-1 z-50");
                modified = true;
            }
            // For the menu items
            if (content.includes("px-5 py-3 text-sm text-slate-700")) {
                content = content.replace(/px-5 py-3 text-sm text-slate-700/g, "px-6 py-4 text-[15px] font-medium text-slate-700 gap-3");
                modified = true;
            }
            if (content.includes("px-5 py-3 text-sm text-emerald-600")) {
                content = content.replace(/px-5 py-3 text-sm text-emerald-600/g, "px-6 py-4 text-[15px] font-medium text-emerald-600 gap-3");
                modified = true;
            }
            if (content.includes("px-5 py-3 text-sm text-red-600")) {
                content = content.replace(/px-5 py-3 text-sm text-red-600/g, "px-6 py-4 text-[15px] font-medium text-red-600 gap-3");
                modified = true;
            }
            
            // Previous text classes
            if (content.includes("px-4 py-2 text-sm text-slate-700")) {
                content = content.replace(/px-4 py-2 text-sm text-slate-700/g, "px-6 py-4 text-[15px] font-medium text-slate-700 gap-3");
                modified = true;
            }
            if (content.includes("px-4 py-2 text-sm text-red-600")) {
                content = content.replace(/px-4 py-2 text-sm text-red-600/g, "px-6 py-4 text-[15px] font-medium text-red-600 gap-3");
                modified = true;
            }

            if (content.includes("w-[40px]")) {
                content = content.replace(/w-\[40px\]/g, "w-[44px]");
            }
            if (content.includes("height: '40px'")) {
                content = content.replace(/height: '40px'/g, "height: '44px'");
            }
            if (content.includes("width: '40px'")) {
                content = content.replace(/width: '40px'/g, "width: '44px'");
            }
            
            // update th font sizes
            if (content.includes("fontSize: '12px'")) {
              content = content.replace(/fontSize: '12px'/g, "fontSize: '14px'");
              modified = true;
            }
            // update td padding and font sizes from old values
            if (content.includes("padding: '12px 16px'")) {
                content = content.replace(/padding: '12px 16px'/g, "padding: '16px 20px'");
                modified = true;
            }
            if (content.includes("fontSize: '13px'")) {
              content = content.replace(/fontSize: '13px'/g, "fontSize: '15px'");
              modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated dropdowns ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
