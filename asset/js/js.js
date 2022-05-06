/** các chức năng 
         * 1. Render sóng
         * 2. Scoll top
         * 3. Play/ pause/ seek
         * 4. CD rotate
         * 5. Next/ prev
         * 6. Radom
         * 7. Next/ Repeat when ended
         * 8. Active song
         * 9. Scroll active song into view
         * 10. play song when click
         */

 const $ = document.querySelector.bind(document)
 const $$ = document.querySelectorAll.bind(document)

 const PlAYER_STORAGE_KEY = "F8_PLAYER";

 const player = $('.player')
 const cd = $('.cd')
 const heading = $('header h2')
 const cdThumb = $('.cd-thumb')
 const audio = $('#audio')
 const playBtn = $('.btn-toggle-play')
 const progress = $('#progress')
 const nextBtn = $('.btn-next')
 const prevBtn = $('.btn-prev')
 const randomBtn = $('.btn-random')
 const repeatBtn = $('.btn-repeat')
 const playlist = $('.playlist')


 const app = {
    currentIndex : 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    songs: [
    {
        name: 'Ngày Đầu Tiên',
        singer: 'Đức Phúc',
        path: './asset/music/NgayDauTien-DucPhuc-7129810.mp3',
        image: './asset/img/ngaydautien.jpeg',
    },
    {
        name: 'Ai Đua Em Về',
        singer: 'TIA, Lê Thiện Hiếu',
        path: './asset/music/AiDuaEmVe-TiaHaiChauLeThienHieu-6037113.mp3',
        image: './asset/img/aiduaemve.jpg',
    },
    {
        name: 'Vui Lắm Nha',
        singer: 'Hương Ly-Jombie',
        path: './asset/music/VuiLamNha-HuongLy_Jombie.mp3',
        image: './asset/img/vuilamnha.jpg',
    },
    {
        name: 'Sau Lưng Anh Có Ai Kìa',
        singer: 'Thiếu Bảo Trâm',
        path: './asset/music/SauLungAnhCoAiKia-ThieuBaoTram-7198536.mp3',
        image: './asset/img/saulunganhcoaikia.jpg',
    },
    {
        name: 'Tabun',
        singer: 'Yoasobi ',
        path: './asset/music/Tabun - YOASOBI.mp3',
        image: './asset/img/tabun.jpg',
    },
    {
        name: 'Shape of You',
        singer: 'ED Sheeran',
        path: './asset/music/ShapeOfYou-EdSheeran-6443488.mp3',
        image: './asset/img/shapeofyou.jpg',
    },
    {
        name: 'Perfect',
        singer: 'ED Sheeran',
        path: './asset/music/Perfect-EdSheeran-5208784.mp3',
        image: './asset/img/Ed_Sheeran.jpg',
    },
    {
        name: 'Đám Cưới Nha',
        singer: 'Hồng Thanh-DJ Mie',
        path: './asset/music/DamCuoiNha-HongThanhDJMie-7198439.mp3',
        image: './asset/img/damcuoinha.jpg',
    }],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex? 'active' : ''}" data-index = "${index}">
            <div class="thumb" style="background-image: url('${song.image}">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`
        })
        playlist.innerHTML = htmls.join('\n')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get:function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    //xử lý sử kiện
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //Xử lý phóng to/ thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            //có 1 số trình duyệt không dùng window.scrollY thay vào đó là document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            
            //khi kéo lên thu nhỏ
            //kiểm tra xem đã về 0 hay chưa để ẩn
            cd.style.width = newCdWidth > 0? newCdWidth +'px' : 0;

            //kéo lên cho nó mờ dần
            cd.style.opacity = newCdWidth / cdWidth
            
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }
        //khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }

        //xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //khi next song
        nextBtn.onclick = function() {
            if ( _this.isRandom ){
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //khi prev song
        prevBtn.onclick = function() {
            if ( _this.isRandom ){
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // khi random song bật/ tắt
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //xử lý lặp lại song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            }else {
                nextBtn.onclick()
            }
        }

        // lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)') 
            if (songNode||!e.target.closest('option') ) {
                 //xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //xử lý khi click vào option
                if(!e.target.closest('option')) {

                }
            }
        }

    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300);
    },

    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },


    
    start : function() {
        //gán cấu hình từ ocnfig vào object app
        this.loadConfig()
        //định nghĩa các thuộc tính cho Object
        this.defineProperties()
        
        //Lắng nghe/xử lý các sử kiện (DOM Events)
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy úng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render()

        //hiện thị trạng thái ban đầu của button repeat & random
        // randomBtn.classList.toggle("active", this.isRandom);
        // repeatBtn.classList.toggle("active", this.isRepeat);
    }
}
app.start()