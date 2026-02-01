/**
 * Resizes an image file to a maximum dimension and compresses it.
 * @param {File} file - The image file to resize.
 * @param {number} maxWidth - Maximum width (or height) in pixels. Default 800.
 * @param {number} quality - JPEG quality (0 to 1). Default 0.7.
 * @returns {Promise<string>} - A promise that resolves to the Base64 string of the resized image.
 */
export const resizeImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxWidth) {
                        width *= maxWidth / height;
                        height = maxWidth;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Uploads an image to Firebase Storage.
 * @param {File} file - The image file to upload.
 * @param {string} path - The storage path (e.g., 'profile_photos/userId').
 * @returns {Promise<string>} - A promise that resolves to the download URL.
 */
export const uploadImage = async (file, path) => {
    const { getStorage, ref, uploadString, getDownloadURL } = await import('firebase/storage');
    const storage = getStorage();

    // Resize the image first to reduce storage size
    const resizedBase64 = await resizeImage(file, 400, 0.8);

    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload the base64 string
    await uploadString(storageRef, resizedBase64, 'data_url');

    // Get and return the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};
