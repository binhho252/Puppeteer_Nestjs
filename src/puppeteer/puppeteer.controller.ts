import { Controller, Get, Query } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';

@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Get('crawl-youtube')
  async crawlYouTube(@Query('url') url: string) {
    if (!url) {
      return { message: 'Please provide a YouTube video URL', success: false };
    }

    try {
      await this.puppeteerService.initBrowser(); // Khởi tạo trình duyệt
      await this.puppeteerService.crawlYouTubeData(url); // Gọi hàm crawl
      return { message: 'Crawling completed!', success: true };
    } catch (error) {
      console.error('Error:', error.message);
      return { message: 'Crawling failed due to an error.', success: false, error: error.message };
    } finally {
      await this.puppeteerService.closeBrowser(); // Đảm bảo trình duyệt luôn được đóng
    }
  }
}
