package p2p;

import p2p.controller.FileController;

public class App {
    public static void main(String[] args) {
        try{
            FileController fileController = new FileController(8080);
            fileController.start();
            System.out.println("PeerLink Server started on port 8080.");
            System.out.println("Waiting for incoming connections...");
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("Shutting down PeerLink Server...");
                fileController.stop();
            }));

            System.out.println("Press Enter to stop the server.");



        } catch (Exception ex) {
            System.out.println("Error starting the file controller: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}
