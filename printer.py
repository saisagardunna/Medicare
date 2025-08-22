def save_files_data(file_paths, output_file):
    with open(output_file, 'w', encoding='utf-8') as out_file:
        for path in file_paths:
            out_file.write(f"\n\n=== File: {path} ===\n")
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    out_file.write(content)
            except Exception as e:
                out_file.write(f"[Error reading file]: {e}")

if __name__ == "__main__":
    # 🔧 Replace with your actual file paths
    files = [
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\analysis\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\api\chat\route.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\api\gemini-places\route.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\api\google-places\route.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\api\place-details\route.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\api\places\route.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\chatbot\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\contact\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\dashboard\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\maps\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\sign-in\[[...sign-in]]\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\sign-up\[[...sign-up]]\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\globals.css",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\layout.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\app\page.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\components\interactive-map.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\components\loading.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\components\theme-provider.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\hooks\use-mobile.tsx",
        r"C:\Users\saisagar\Downloads\medical-app (1)\hooks\use-toast.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\lib\utils.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\middleware.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\package.json",
        r"C:\Users\saisagar\Downloads\medical-app (1)\tailwind.config.ts",
        r"C:\Users\saisagar\Downloads\medical-app (1)\tsconfig.json",
        
        
    ]
    
    # 🔧 Output file where results will be saved
    output = r"C:\Users\saisagar\Downloads\medical-app (1)\output.txt"

    save_files_data(files, output)
    print(f"Data saved to {output}")