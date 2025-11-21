#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <chrono>

using namespace std;
using namespace std::chrono;

// ==========================================
// 1. ALGORITMOS ADAPTADOS PARA SOLAPAMIENTO
// ==========================================

vector<int> rabinKarp(const string &text, const string &pat, bool allowOverlap) {
    int n = text.length();
    int m = pat.length();
    if (n < m) return {};

    long long p = 31;
    long long mod = 1e9 + 9;

    long long h_pat = 0;
    long long h_txt = 0;
    long long h = 1;

    for (int i = 0; i < m - 1; i++) h = (h * p) % mod;

    // Calcular hash inicial
    for (int i = 0; i < m; i++) {
        h_pat = (p * h_pat + pat[i]) % mod;
        h_txt = (p * h_txt + text[i]) % mod;
    }

    vector<int> result;
    bool recompute = false; // Bandera para recalcular hash si saltamos

    for (int i = 0; i <= n - m; ) { // OJO: quitamos el i++ del for para controlarlo manualmente
        
        // Si venimos de un salto (no solapamiento), recalculamos el hash de la ventana actual
        if (recompute) {
            h_txt = 0;
            for (int k = 0; k < m; k++) {
                h_txt = (p * h_txt + text[i + k]) % mod;
            }
            recompute = false;
        }

        if (h_pat == h_txt) {
            bool match = true;
            for (int j = 0; j < m; j++) {
                if (text[i + j] != pat[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                result.push_back(i);
                if (!allowOverlap) {
                    // SIN SOLAPAMIENTO: Saltamos el tamaño del patrón
                    i += m; 
                    recompute = true; // Necesitamos recalcular el hash en la nueva posición
                    continue; 
                }
            }
        }

        // Avanzar ventana (Rolling Hash)
        if (i < n - m) {
            h_txt = (p * (h_txt - text[i] * h) + text[i + m]) % mod;
            if (h_txt < 0) h_txt = (h_txt + mod);
        }
        i++;
    }
    return result;
}

vector<int> buildLPS(const string &P){
    int size = P.size();
    vector<int> lps(size, 0);
    int len = 0, i = 1;
    while(i < size){
        if(P[i] == P[len]) lps[i++] = ++len;
        else if(len != 0) len = lps[len - 1];
        else lps[i++] = 0;
    }
    return lps;
}

vector<int> KMP(const string &T, const string &P, bool allowOverlap){
    int n = T.size(), m = P.size();
    if(m == 0) return {};
    vector<int> lps = buildLPS(P);
    int i = 0, j = 0;
    vector<int> ans;

    while(i < n){
        if(T[i] == P[j]){
            i++; j++;
            if(j == m){ 
                ans.push_back(i - j); 
                
                if (allowOverlap) {
                    j = lps[j - 1]; // Seguir buscando solapados
                } else {
                    j = 0; // Reiniciar para no permitir solapamiento
                }
            }
        } else if(j != 0) j = lps[j - 1];
        else i++;
    }
    return ans;
}

// ==========================================
// 2. MAIN
// ==========================================
int main(int argc, char* argv[]) {
    ios_base::sync_with_stdio(false); cin.tie(NULL);

    // Esperamos: [PATRON] [RUTA] [ALGORITMO] [SOLAPAMIENTO]
    if (argc < 3) { cout << "[]" << endl; return 1; }

    string patron = argv[1];
    string rutaArchivo = argv[2];
    string algoritmo = (argc > 3) ? argv[3] : "KMP";
    
    // Leemos el 4to argumento. Si es "1" o "true" -> true.
    string overlapArg = (argc > 4) ? argv[4] : "true";
    bool allowOverlap = (overlapArg == "true" || overlapArg == "1");

    ifstream file(rutaArchivo);
    if (!file.is_open()) { cout << "[]" << endl; return 1; }

    string linea;
    cout << "[";
    bool primero = true;

    while (getline(file, linea)) {
        if (!linea.empty() && linea.back() == '\r') linea.pop_back();
        stringstream ss(linea);
        string nombre, adn;

        if (getline(ss, nombre, ',') && getline(ss, adn, ',')) {
            vector<int> coincidencias;
            
            auto start = high_resolution_clock::now();
            
            if (algoritmo == "Rabin-Karp") coincidencias = rabinKarp(adn, patron, allowOverlap);
            else coincidencias = KMP(adn, patron, allowOverlap);
            
            auto stop = high_resolution_clock::now();
            auto duration = duration_cast<microseconds>(stop - start);
            double tiempoMs = duration.count() / 1000.0;

            if (!coincidencias.empty()) {
                if (!primero) cout << ",";
                cout << "{";
                cout << "\"name\": \"" << nombre << "\",";
                cout << "\"sequence\": \"" << adn << "\",";
                cout << "\"executionTime\": " << tiempoMs << ",";
                cout << "\"positions\": [";
                for(size_t i=0; i<coincidencias.size(); ++i){
                    cout << coincidencias[i];
                    if(i < coincidencias.size()-1) cout << ",";
                }
                cout << "]";
                cout << "}";
                primero = false;
            }
        }
    }
    cout << "]" << endl;
    return 0;
}