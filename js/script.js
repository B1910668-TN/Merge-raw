var mergedImage;

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function loadImage(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();

            img.onload = function() {
                hideLoading();
                resolve(img);
            };

            img.onerror = function() {
                hideLoading();
                reject(new Error("Lỗi khi tải ảnh: " + file.name));
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
}

function mergeImagesInternal(images) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    document.getElementById("mess").innerHTML = " ";
    // Thiết lập kích thước canvas
    canvas.width = images[0].width;
    canvas.height = images.reduce((totalHeight, img) => totalHeight + img.height, 0);

    // Ghép ảnh
    var yOffset = 0;
    images.forEach(function(img) {
        ctx.drawImage(img, 0, yOffset);
        yOffset += img.height;
    });

    // Tạo ảnh mới từ canvas
    var mergedImage = new Image();

    // Kiểm tra lỗi khi ghép xong
    mergedImage.onerror = function() {
        showLoading();
        document.getElementById("output").innerHTML = " ";
        document.getElementById("mess").innerHTML = "Nhiều quá tớ ghép không được, giảm xuống một xí nhé!";
    };

    mergedImage.src = canvas.toDataURL('image/jpeg', 0.8); // Đổi định dạng thành jpeg và chỉ số chất lượng
    return mergedImage;
}

function mergeImages() {
    var input = document.getElementById('imageInput');
    var outputDiv = document.getElementById('output');
    document.getElementById("mess").innerHTML = "Đang tiến hành ghép, cậu chờ tớ chút nha~";

    outputDiv.innerHTML = ''; // Xóa nội dung cũ

    var maxImages = 50; // Số lượng ảnh tối đa
    var maxSizeMB = 100; // Kích thước tối đa cho mỗi ảnh (đơn vị: MB)

    if (input.files && input.files.length > 0) {
        if (input.files.length > maxImages) {
            alert('Số lượng ảnh vượt quá giới hạn cho phép. Số lượng ảnh tối đa chỉ 50 thôi ạ, giảm lại giúp mình nha!');
            return;
        }

        var totalSizeMB = 0;

        var promises = [];
        for (var i = 0; i < input.files.length; i++) {
            totalSizeMB += input.files[i].size / (1024 * 1024); // Chuyển đổi từ byte sang MB

            if (totalSizeMB > maxSizeMB) {
                alert('Tổng kích thước ảnh vượt quá giới hạn cho phép.');
                return;
            }

            promises.push(loadImage(input.files[i]));
        }

        Promise.all(promises)
            .then(function(images) {
                mergedImage = mergeImagesInternal(images);
                outputDiv.appendChild(mergedImage);
            })
            .catch(function(error) {
                alert(error.message);
            });
    } else {
        alert('Vui lòng chọn ít nhất một ảnh.');
    }
}

function saveImage() {
    if (mergedImage) {
        // Lưu ảnh ghép
        showLoading();
        var link = document.createElement('a');
        link.href = mergedImage.src;
        link.download = 'merged_image.jpg'; // Đổi phần mở rộng thành jpg
        link.click();
    } else {
        alert('Vui lòng ghép ảnh trước khi lưu.');
    }
}

document.addEventListener('mousemove', (e) => {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${e.pageX}px`;
    star.style.top = `${e.pageY}px`;

    document.body.appendChild(star);

    // Tự động xóa ngôi sao sau khoảng thời gian ngắn
    setTimeout(() => {
        star.remove();
    }, 600);
});
