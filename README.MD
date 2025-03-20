# Update

## 1. user/DiscoveryScreen:

Danh sách thư viện (public & private), ưu tiên làm text trước, làm map nếu thời gian cho phép
Navigate vào màn này sau khi register

### Components

. qr code scanner: scan mã để kết nối thư viện (ví dụ: thư viện A dán mã ở quầy thủ thư) (có thể tận dụng lại scanner bên admin)
. connect to address/code: kết nối đến thư viện riêng tư
. scan code: tương tự như component trên nhưng dùng camera quét mã (có thể kèm nút scan cạnh nút search)
. chọn trên map: tương tự search bar nhưng chọn trên map
. search bar: chỉ search thư viện công cộng, có thể tích hợp trong map
vd: Thư viện Thạch Thất, user123's library, ...
. hiện danh sách các thư viện tìm được (text hoặc marker trên map)
. nút tạo thư viện: có thể để text gợi ý vd "Wanna lend some books? Click here"

## 2. partner/AddLibraryScreen:

Màn hình cho user tự tạo thư viện

### Components

- form điền thông tin thư viện/bộ sưu tập: như fanpage, có thể chứa description, ... vd "Đây là bộ sách 69 cuốn của tác giả ABC được sưu tầm bới XYZ", "i lend my books for fun", ...
- nút thêm sách (navigate đến quản lí sách)

### Logic

- Khi tạo profile cho thuê (thư viện) phải có phương thức liên lạc hoặc địa chỉ

## 3. partner/ManageLibraryScreen

Dashboard thư viện với nút quản lí sách và phạt (không có quản lí user)

### Components

- list sách
- các action trên mỗi sách: edit, remove, ...
- khi click mỗi sách navigate sang màn book detail của partner

### Logic

- Chỉ được phép edit 1 số field như ảnh bìa, mô tả, ..
- Không được edit ISBN, NXB, tên sách, ... sau khi có ít nhất 1 người mượn

## 4. partner/BookDetailsScreen

Xem thông tin sách và thông tin người mượn

### Components

- các thông tin của sách: số copy, ...
- các action (nút): edit, remove, ...
- danh sách người mượn (và đặt trước) nếu có
- khi click vào mỗi người mượn, navigate sang partner/ViewBorrowerScreen

## 5. partner/ViewBorrowerScreen

Xem thông tin của 1 người mượn với 1 sách cụ thể do mình list trên hệ thống

### Components

- thông tin người mượn + sách (sơ lược)
- thông tin hạn trả + phạt nếu có
- các action (nút): đánh dấu đã trả sách, gia hạn, liên lạc, nhắc, report

### Logic

- Liên lạc: mở link profile liên kết, vd m.me/... -> nhảy sang app messenger (nếu user đó có set field này)
- Nhắc khi quá hạn < 7 ngày
- Report khi quá hạn > 7 ngày (có thể mở popup confirm và ghi các điều khoản: vd hệ thống sẽ hoàn tiền, ...)

## 6. user/PaymentScreen.js

Hiện thị thông tin thanh toán bao gồm: tiền mượn, tiền phạt (danh sách các sách (sắp) đến/quá hạn trả)

### Components

- tổng hợp tiền phạt và tiền mượn sách
- danh sách tài khoản ngân hàng/thẻ đã liên kết
- nút thêm/gỡ TKNN/thẻ
- nút trả phạt nhanh: thanh toán toàn bộ
- danh sách các sách: có thể thêm search và filter theo hạn trả, ...
- mỗi sách khi click navigate sang user/BookDetailScreen
- trên mỗi sách: nút thanh toán, nút nộp phạt gửi muộn (dùng các icon cảnh báo, màu vàng cam đỏ, ...)

### Logic

- Quá hạn dưới 7 ngày: nhắc nhở
- Quá hạn trên 7 ngày: cảnh báo (bạn có thể bị cấm mượn sách đến khi nộp phạt hoặc đóng tài khoản vĩnh viễn, ...)

---

# Data format:

```js
libraries: [
  {
    id: "123",
    name: "abc",
    owner: "xyz", // userId
    // other fields
  },
];

books: [
  {
    id: "1",
    libraryId: "123",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9781847941831",
    copies: [
      {
        id: 1,
        borrowedBy: "456", // userId
      },
      {
        id: 2,
        borrowedBy: null, // -> available to borrow
      },
    ],
    reservedBy: ["456", "789", "1a2"], // in fact when id 2 is still available, one of them would be able to borrow
    // other fields
  },
];

users: [
  {
    id: "123",
    // data fields
  },
];

transactions: [
  // just use whatever fields you want to log payments
];
```

There are some generated logic at `./services/demo/dataService.js`
