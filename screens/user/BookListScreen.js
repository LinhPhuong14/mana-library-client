import React, { useState } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from "react-native";

const books = [
    {
        title: "1984",
        description: "Dystopian novel set in a totalitarian society.",
    },
    {
        title: "To Kill a Mockingbird",
        description: "A story of racial injustice in the American South.",
    },
    {
        title: "Pride and Prejudice",
        description: "Classic novel of manners and marriage.",
    },
    {
        "title": "Tây Du Ký",
        "description": "Tiểu thuyết cổ điển Trung Quốc, gắn liền với hành trình của Đường Tăng và bốn đồ đệ."
    },
    {
        "title": "Nhật ký trong tù",
        "description": "Tập thơ của Chủ tịch Hồ Chí Minh trong thời gian bị giam cầm."
    },
    {
        "title": "Dế Mèn Phiêu Lưu Ký",
        "description": "Một tác phẩm thiếu nhi nổi tiếng của nhà văn Tô Hoài về cuộc phiêu lưu của Dế Mèn."
    },
    {
        "title": "Nỗi Buồn Chiến Tranh",
        "description": "Tiểu thuyết của Bảo Ninh mô tả tâm trạng và hậu quả chiến tranh đối với con người."
    },
    {
        "title": "Chí Phèo",
        "description": "Tác phẩm của Nam Cao, phê phán xã hội cũ và nỗi đau của nhân vật Chí Phèo."
    },
    {
        "title": "Số Đỏ",
        "description": "Tiểu thuyết châm biếm xã hội của Vũ Trọng Phụng về cuộc sống thời kỳ Pháp thuộc."
    },
    {
        "title": "Lão Hạc",
        "description": "Một trong những tác phẩm tiêu biểu của Nam Cao, phản ánh cuộc sống nghèo khổ của người nông dân."
    },
    {
        "title": "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
        "description": "Một câu chuyện về tuổi thơ, tình bạn và gia đình của tác giả Nguyễn Nhật Ánh."
    },
    {
        "title": "Cánh Đồng Bất Tận",
        "description": "Tiểu thuyết của Nguyễn Ngọc Tư về những số phận nghèo khó ở miền Tây Nam Bộ."
    },
    {
        "title": "Mắt Biếc",
        "description": "Một tác phẩm tình cảm lãng mạn của Nguyễn Nhật Ánh về tình yêu trong sáng và khát khao mãnh liệt."
    },
    {
        "title": "Tâm Hồn Cao Thượng",
        "description": "Một câu chuyện về tình yêu, lòng nhân ái và sự hy sinh của nhà văn Nguyễn Minh Châu."
    },
    {
        "title": "Bến Không Chồng",
        "description": "Tác phẩm của nhà văn Dương Hướng, nói về tình yêu và sự khao khát tự do trong cuộc sống."
    },
    {
        "title": "Đoàn Tùy Nghĩa",
        "description": "Cuốn sách nói về những cuộc chiến tranh và những con người hi sinh trong cuộc đấu tranh giành độc lập."
    },
    {
        "title": "Nghĩa Sĩ Cần Giuộc",
        "description": "Lịch sử chiến đấu của nghĩa sĩ trong kháng chiến chống Pháp."
    },
    {
        "title": "Mưa Ngâu",
        "description": "Tiểu thuyết của nhà văn Nguyễn Ngọc Tư, miêu tả cuộc sống của những người phụ nữ miền Tây Nam Bộ."
    },
    {
        "title": "Dòng Sông Cái",
        "description": "Một tác phẩm của nhà văn Nguyễn Thị Thu Huệ, phản ánh cuộc sống khốn khó ở một làng quê."
    },
    {
        "title": "Con Cái Mất Tích",
        "description": "Tác phẩm miêu tả những cuộc sống đầy thử thách và gian nan của những gia đình nghèo khó."
    },
    {
        "title": "Đất Rừng Phương Nam",
        "description": "Tiểu thuyết lịch sử về một vùng đất phương Nam của tác giả Đoàn Giỏi."
    },
    {
        "title": "Phố Vắng Người",
        "description": "Một câu chuyện về những cuộc sống lặng lẽ trong xã hội hiện đại của tác giả Hoàng Ngọc Tuấn."
    },
    {
        "title": "Đi Bắt Cái Con",
        "description": "Tiểu thuyết của nhà văn Võ Quảng, kể về những chuyến đi đầy gian nan của một người dân miền biển."
    }
];

const BookListScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredBooks, setFilteredBooks] = useState(books);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text === "") {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter((book) =>
                book.title.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    };

    const handleNavigateToBookDetail = (book) => {
        console.log("Navigating to BookDetailScreen for book:", book.title);
        navigation.navigate("BookDetail", { book });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search books..."
                value={searchQuery}
                onChangeText={handleSearch}
            />

            <Text style={styles.sectionTitle}>Recommended books</Text>
            <FlatList
                data={filteredBooks}
                keyExtractor={(item) => item.title}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.bookCard}
                        onPress={() => handleNavigateToBookDetail(item)}
                    >
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle}>{item.title}</Text>
                            <Text style={styles.bookDescription}>{item.description}</Text>
                            <TouchableOpacity style={styles.borrowButton}>
                                <Text style={styles.borrowText}>Borrow</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => handleNavigateToBookDetail()}
            >
                <Text style={styles.showMoreText}>Show more</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flex: 1,
    },
    searchBar: {
        backgroundColor: "#ddd",
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 15,
    },
    bookCard: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    bookDescription: {
        fontSize: 14,
        color: "#555",
        marginVertical: 5,
    },
    borrowButton: {
        borderWidth: 1,
        borderColor: "#6200ea",
        padding: 5,
        borderRadius: 5,
        width: 70,
        alignItems: "center",
    },
    borrowText: {
        color: "#6200ea",
    },
    showMoreButton: {
        backgroundColor: "#eee",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    showMoreText: {
        fontSize: 16,
    },
});

export default BookListScreen;
