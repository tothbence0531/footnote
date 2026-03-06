import { Injectable } from '@angular/core';
import QRCode from 'qrcode';
import { environment } from '../../environments/environment.dev';

@Injectable({ providedIn: 'root' })
export class BookmarkGeneratorService {
  API_URL = environment.apiUrl;

  async generateBookmark(
    bookId: string,
    backgroundImageUrl: string,
  ): Promise<void> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = 450;
    canvas.height = 1000;

    const bg = await this.loadImage(backgroundImageUrl);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    const qrDataUrl = await QRCode.toDataURL(this.API_URL + '/book/' + bookId, {
      width: 200,
      margin: 1,
      color: {
        dark: '#2e1d1a',
        light: '#f7f4ef',
      },
    });

    const qrImage = await this.loadImage(qrDataUrl);
    const qrSize = 180;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = canvas.height - qrSize - 40;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(bookId, canvas.width / 2, qrY + qrSize + 25);

    this.downloadCanvas(canvas, `bookmark-${bookId}.png`);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
