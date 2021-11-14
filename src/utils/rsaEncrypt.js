import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtKbkyH8g+W88+zCaqn5+NuEM9joVhnJP/YA6X92RWeAjEXPU1DGn3jCVEns4rkSQUryfEbtUhNAowIBmrJugw5tAHfK8nfKVsDLtBxcqNEfvg9vuRu+f3uoe/lBua9vF5lFYJqWz+nIMq51JUeBEIoprlleya+KB0Ni6hufVJznzMUxPqUjIDKl0zLUyVzpEynfbwBA8gJg/YyA0zyRnzl+OO9KT4F/kTyacZbNJOz1a4fcTIcVxkv/J1rt5BDUsHizQa58y2zVw9m80WKu5b7k4MpjIQik08vSan5S5iN7P9sMTdxvApAaZ98Zuk8OxB5QOF2Nxx1UBqL77l6RNhwIDAQAB'

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

