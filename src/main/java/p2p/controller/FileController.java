package p2p.controller;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpServer;

import p2p.service.FileSharer;

public class FileController {

    private final FileSharer fileSharer;
    private final HttpServer server;
    private final String uploadDir;
    private final ExecutorService executorService;

    public FileController(int port) throws IOException {
        this.fileSharer = new FileSharer();
        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.uploadDir = System.getProperty("java.io.tmpdir") + File.separator + "peerlink-uploads";
        this.executorService = Executors.newFixedThreadPool(10);

        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
        }

        server.createContext("/upload", new UploadHandler());
        server.createContext("/download", new DownloadHandler());
        server.createContext("/", new CORSHandler());
        server.setExecutor(executorService);

    }

    public void start() {
        server.start();
        System.out.println("API Server started on port " + server.getAddress().getPort());
    }

    public void stop() {
        server.stop(0);
        executorService.shutdown();
        System.out.println("API Server stopped.");
    }

    private class CORSHandler implements com.sun.net.httpserver.HttpHandler {
        @Override
        public void handle(com.sun.net.httpserver.HttpExchange exchange) throws IOException {
            Headers headers = exchange.getResponseHeaders();
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            if (exchange.getRequestMethod().equals("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String response = "NOT FOUND";
            exchange.sendResponseHeaders(404, response.getBytes().length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());

            }
        }
    }

    private class UploadHandler implements com.sun.net.httpserver.HttpHandler {
        @Override
        public void handle(com.sun.net.httpserver.HttpExchange exchange) throws IOException {
            Headers headers = exchange.getResponseHeaders();
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "POST, OPTIONS");
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                String response = "Method Not Allowed";
                exchange.sendResponseHeaders(405, response.getBytes().length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
                return;
            }
           
            Headers requestHeaders = exchange.getRequestHeaders();
            String contentType = requestHeaders.getFirst("Content-Type");
            if(contentType == null || !contentType.startsWith("multipart/form-data")) {
                String response = "Bad Request: Content-Type must be multipart/form-data";
                exchange.sendResponseHeaders(400, response.getBytes().length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
                return;
            }

            try{
                String  boundary = contentType.substring(contentType.indexOf("boundary=") + 9);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();

                try (InputStream is = exchange.getRequestBody()) {
                    byte[] buffer = new byte[8192];
                    int read;
                    while ((read = is.read(buffer)) != -1) {
                        baos.write(buffer, 0, read);
                    }
                }
                byte[] requestData = baos.toByteArray();

                Multiparser parser = new Multiparser(requestData, boundary);
                Multiparser.ParseResult result = parser.parse();

                if (result == null) {
                    String response = "Bad Request: Unable to parse file content";
                    exchange.sendResponseHeaders(400, response.getBytes().length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(response.getBytes());
                    }
                    return;
                }

                String fileName = result.fileName;
                if (fileName == null || fileName.trim().isEmpty()) {
                    fileName = "unnamed_file_";
                }
                String uniqueFileName = UUID.randomUUID().toString() + "_" + new File(fileName).getName();
                String filePath = uploadDir + File.separator + uniqueFileName;

                try (FileOutputStream fos = new FileOutputStream(filePath)) {
                    fos.write(result.fileContent);
                }
                int port = fileSharer.offerFile(filePath);
                new Thread(() -> fileSharer.startFileServer(port)).start();
                String jsonResponse = "{\"port\": " + port + "}";
                headers.add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, jsonResponse.getBytes().length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(jsonResponse.getBytes());
                }

            } catch (Exception e) {
                System.err.println("Error handling file upload: " + e.getMessage());
                String response = "Internal Server Error: " + e.getMessage();
                exchange.sendResponseHeaders(500, response.getBytes().length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }

        }
    }

    public static class Multiparser {
        private final byte[] data;
        private final String boundary;

        public Multiparser(byte[] data, String boundary) {
            this.data = data;
            this.boundary = boundary;
        }

        public ParseResult parse() {

            try {
                String dataAsString = new String(data);
                String filenameMarker = "filename=\"";
                int filenameStart = dataAsString.indexOf(filenameMarker);
                if (filenameStart == -1) {
                    return null;
                }

                int filenameEnd = dataAsString.indexOf("\"", filenameStart); 
                String fileName = dataAsString.substring(filenameStart, filenameEnd);

                String contentTypeMarker = "Content-Type: ";
                String contentType = "application/octet-stream";
                int contentTypeStart = dataAsString.indexOf(contentTypeMarker, filenameEnd);
                if (contentTypeStart != -1) {
                    contentTypeStart += contentTypeMarker.length();
                    int contentTypeEnd = dataAsString.indexOf("\r\n", contentTypeStart);
                    contentType = dataAsString.substring(contentTypeStart, contentTypeEnd);
                }

                String headerEndMarker = "\r\n\r\n";
                int headerEnd = dataAsString.indexOf(headerEndMarker);
                if (headerEnd == -1) {
                    return null;
                }
                int ContentStart = headerEnd + headerEndMarker.length();

                byte[] boundaryBytes = ("\r\n--" + boundary + "--").getBytes();
                int contentEnd = findSequence(data, boundaryBytes, ContentStart);
                if (contentEnd == -1) {
                    boundaryBytes = ("\r\n--" + boundary).getBytes();
                    contentEnd = findSequence(data, boundaryBytes, ContentStart);
                }
                if (contentEnd == -1 || contentEnd <= ContentStart) {
                    return null;
                }

                byte[] fileContent = new byte[contentEnd - ContentStart];
                System.arraycopy(data, ContentStart, fileContent, 0, fileContent.length);
                return new ParseResult(fileName, fileContent, contentType);

            } catch (Exception e) {
                System.err.println("Error parsing multipart data: " + e.getMessage());
                return null;
            }

        }

    public static class ParseResult {
        private final String fileName;
        private final byte[] fileContent;
        public final String contentType;

        public ParseResult(String fileName, byte[] fileContent, String contentType) {
            this.fileName = fileName;
            this.fileContent = fileContent;
            this.contentType = contentType;
        }

    }

    private static int findSequence(byte[] data, byte[] sequence, int startPos) {
        outer:
        for (int i = startPos; i <= data.length - sequence.length; i++) {
            for (int j = 0; j < sequence.length; j++) {
                if (data[i + j] != sequence[j]) {
                    continue outer;
                }
            }
            return i;
        }
        return -1;
    }
}

    private class DownloadHandler implements com.sun.net.httpserver.HttpHandler {
        @Override
        public void handle(com.sun.net.httpserver.HttpExchange exchange) throws IOException {
            Headers headers = exchange.getResponseHeaders();
            headers.add("Access-Control-Allow-Origin", "*");

            if(!exchange.getRequestMethod().equalsIgnoreCase("GET")) {
                String response = "Method Not Allowed";
                exchange.sendResponseHeaders(405, response.getBytes().length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String portStr = path.substring(path.lastIndexOf("/") + 1);
            try {
                int port = Integer.parseInt(portStr);

                try (Socket socket = new Socket("localhost", port)) {
                     InputStream is = socket.getInputStream();
                     File tempFile = File.createTempFile("download-", ".tmp");
                     String fileName = "downloaded-file";
                    try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                         byte[] buffer = new byte[4096];
                         int bytesRead;
                         ByteArrayOutputStream HeaderBaos = new ByteArrayOutputStream();
                         int b;
                         while((b = is.read()) != -1) {
                             if (b == '\n') break;
                             HeaderBaos.write(b);
                         }
                         String header = HeaderBaos.toString();
                         if (header.startsWith("FILENAME:")) {
                             if (header.startsWith("Filename: ")) {
                                    fileName = header.substring("Filename: ".length());
                                }
                         }
                         while((bytesRead = is.read(buffer)) != -1) {
                             fos.write(buffer, 0, bytesRead);
                         }

                         headers.add("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
                         headers.add("Content-Type", "application/octet-stream");
                         exchange.sendResponseHeaders(200, tempFile.length());
                         try (OutputStream os = exchange.getResponseBody()){
                              FileInputStream fis = new FileInputStream(tempFile);
                              byte[] fileBuffer = new byte[4096];
                              int fileBytesRead;
                              while((fileBytesRead = fis.read(fileBuffer)) != -1) {
                                  os.write(fileBuffer, 0, fileBytesRead);
                              }
                         }
                         tempFile.delete();
                    }

                }


                
            } catch (Exception ex) {
                System.err.println("Error downloading the file: " + ex.getMessage());
                String response = "Error downloading the file: " + ex.getMessage();
                headers.add("Content-Type", "text/plain");
                exchange.sendResponseHeaders(400, response.getBytes().length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }
        }

    }
}
