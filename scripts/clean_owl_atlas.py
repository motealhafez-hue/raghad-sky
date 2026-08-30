"""Build a transparent 4×4 owl atlas from the generated neutral checkerboard source."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def largest_component(mask: np.ndarray) -> np.ndarray:
    height, width = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    largest: list[tuple[int, int]] = []
    neighbors = ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1))

    for y, x in np.argwhere(mask):
        if visited[y, x]:
            continue
        queue = deque([(int(y), int(x))])
        visited[y, x] = True
        component: list[tuple[int, int]] = []
        while queue:
            current_y, current_x = queue.popleft()
            component.append((current_y, current_x))
            for offset_y, offset_x in neighbors:
                next_y = current_y + offset_y
                next_x = current_x + offset_x
                if 0 <= next_y < height and 0 <= next_x < width and mask[next_y, next_x] and not visited[next_y, next_x]:
                    visited[next_y, next_x] = True
                    queue.append((next_y, next_x))
        if len(component) > len(largest):
            largest = component

    result = np.zeros_like(mask, dtype=np.uint8)
    for y, x in largest:
        result[y, x] = 255
    return result


def clean(source_path: Path, destination_path: Path) -> None:
    source = Image.open(source_path).convert('RGB')
    pixels = np.asarray(source).astype(np.int16)
    maximum = pixels.max(axis=2)
    minimum = pixels.min(axis=2)
    chroma = maximum - minimum

    raw_alpha = np.maximum((chroma - 1) * 34, (236 - minimum) * 18)
    raw_alpha = np.clip(raw_alpha, 0, 255).astype(np.uint8)
    median = np.asarray(Image.fromarray(raw_alpha).filter(ImageFilter.MedianFilter(5)))
    raw_alpha[(median < 42) | (raw_alpha < 38)] = 0

    cleaned_alpha = np.zeros_like(raw_alpha)
    cell_width = source.width // 4
    cell_height = source.height // 4
    for row in range(4):
        for column in range(4):
            top = row * cell_height
            left = column * cell_width
            cell = raw_alpha[top:top + cell_height, left:left + cell_width]
            component = largest_component(cell > 0)
            expanded = np.asarray(Image.fromarray(component).filter(ImageFilter.MaxFilter(7))) > 0
            cleaned_alpha[top:top + cell_height, left:left + cell_width] = np.where(expanded, cell, 0)

    alpha = Image.fromarray(cleaned_alpha).filter(ImageFilter.GaussianBlur(0.25))
    result = source.convert('RGBA')
    result.putalpha(alpha)
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    result.save(destination_path, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    clean(args.source, args.destination)


if __name__ == '__main__':
    main()
