// @ts-nocheck
const mockVerifyIdToken = jest.fn()
const mockDocGet = jest.fn()

function createDocRef() {
  return { get: mockDocGet }
}

function createCollectionRef() {
  return {
    doc: jest.fn(() => createDocRef()),
    where: jest.fn(() => createQueryRef()),
    orderBy: jest.fn(() => createQueryRef()),
    add: jest.fn(() => ({ id: 'mock-id' })),
    update: jest.fn(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createQueryRef(): any {
  const ref: any = { docs: [], empty: true, forEach: jest.fn() }
  return {
    get: jest.fn(() => ref),
    orderBy: jest.fn(() => createQueryRef()),
    where: jest.fn(() => createQueryRef()),
    limit: jest.fn(() => createQueryRef()),
  }
}

export const adminAuth = { verifyIdToken: mockVerifyIdToken }
export const adminDb = { collection: jest.fn(() => createCollectionRef()) }

export const _mockVerifyIdToken = mockVerifyIdToken
export const _mockDocGet = mockDocGet

export default { adminAuth, adminDb }
