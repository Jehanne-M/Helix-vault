// use regex::Regex;
// // use std::fs::File;
// // use tauri::http::response;
// // use std::net::TcpStream;
// use tokio::{
//     fs::File,
//     io::{AsyncReadExt, AsyncWriteExt},
//     net::TcpStream,
// };
// pub async fn handle_connection(mut stream: TcpStream) -> anyhow::Result<String, ()> {
//     let mut buffer = [0; 1024];
//     stream
//         .read(&mut buffer)
//         .await
//         .expect("Failed to read from stream");

//     if !buffer.starts_with(b"GET /") {
//         let response = "HTTP/1.1 400 Bad Request\r\n\r\n";
//         stream
//             .write(response.as_bytes())
//             .await
//             .expect("Failed to write error response");
//         stream.flush().await.expect("Failed to flush stream");
//         return Err(());
//     }

//     let mut code;

//     let re = Regex::new(r"code=(.*)&").unwrap();
//     match re.captures(std::str::from_utf8(&buffer).unwrap()) {
//         Some(caps) => {
//             // println!("code: {}", &caps[1]);
//             code = String::from(&caps[1]);
//         }
//         None => {
//             return Err(());
//         }
//     }

//     let mut file = File::open("hello.html").await.expect("Failed to open file");
//     let mut contents = String::new();
//     file.read_to_string(&mut contents)
//         .await
//         .expect("Failed to read file");

//     let response = format!("HTTP/1.1 200 OK\r\n\r\n{}", contents);

//     stream
//         .write(response.as_bytes())
//         .await
//         .expect("Failed to write response");
//     stream.flush().await.expect("Failed to flush stream");

//     Ok(code)
// }
