interface workerDataType {
    position: THREE.Vector3;
    visible: boolean;
}

function getNeighborCount(currentCell: workerDataType, cells: workerDataType[]): number {
    let neighbors = 0;
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        const otherCell = cells[cellIndex];
        if (otherCell === currentCell) {
            continue;
        }

        const xComponent = Math.pow(currentCell.position.x - otherCell.position.x, 2);
        const yComponent = Math.pow(currentCell.position.y - otherCell.position.y, 2);
        const zComponent = Math.pow(currentCell.position.z - otherCell.position.z, 2);
        const distance = Math.sqrt(xComponent + yComponent + zComponent);
        if (distance < 2 && otherCell.visible) {
          neighbors++;
        }
    }
    
    return neighbors;
}

self.onmessage = function(event) {
    const cells = event.data;
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        const currentCell = cells[cellIndex];
        const neighbors = getNeighborCount(currentCell, cells);
        currentCell.visible = neighbors >= 4 && neighbors <= 7;
    }

    self.postMessage(cells);
};