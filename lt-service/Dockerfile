
# LanguageTool Service Dockerfile
# خدمة LanguageTool منفصلة للتشغيل على Render
FROM openjdk:17-jdk-slim

# تثبيت الأدوات المطلوبة
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# إنشاء مجلد العمل
WORKDIR /app

# تنزيل LanguageTool الإصدار 6.6
RUN curl -L -o languagetool.zip https://languagetool.org/download/LanguageTool-6.6.zip && \
    unzip languagetool.zip && \
    rm languagetool.zip && \
    mv LanguageTool-6.6/* . && \
    rmdir LanguageTool-6.6

# تعريض المنفذ 8010
EXPOSE 8010

# تشغيل خادم LanguageTool
CMD ["java", "-cp", "languagetool-server.jar:libs/*", "org.languagetool.server.HTTPServer", "--port", "8010", "--public", "--allow-origin", "*"]
