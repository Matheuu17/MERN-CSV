#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <chrono>

using namespace std;
using namespace std::chrono;

// Programa C++ que busca un patron en secuencias (CSV) usando KMP o Rabin-Karp.
// - Soporta opcion de permitir o no solapamiento entre coincidencias.
// - Lee archivo CSV donde cada linea es: nombre,secuencia(text)
// - Imprime un array JSON con los resultados (name, sequence, executionTime, positions)

// RABIN-KARP
// text: texto donde buscar / pat: patron / allowOverlap: si se permiten coincidencias solapadas
vector<int> rabinKarp(const string &text, const string &pat, bool allowOverlap) {
    int n = text.length();
    int m = pat.length();
    if (n < m) return {};

    long long p = 31;
    long long mod = 1e9 + 9;

    long long h_pat = 0;
    long long h_txt = 0; // hash de la ventana actual en text
    long long h = 1;     // p^(m-1) modulo mod, usado para remover el char viejo

    for (int i = 0; i < m - 1; i++) h = (h * p) % mod;

    // Calcular hash inicial
    for (int i = 0; i < m; i++) {
        h_pat = (p * h_pat + pat[i]) % mod;
        h_txt = (p * h_txt + text[i]) % mod;
    }

    vector<int> result;
    bool recompute = false; // Bander par que si saltamos (no solapamiento) necesitamos recalcular el hash

    // Recorremos ventanas y un control manual de i para poder saltar cuando no se permite solapamiento
    for (int i = 0; i <= n - m; ) {

        // Si hicimos un salto por no permitir solapamiento, recomputar hash completo
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
                    // Si no permitimos solapamiento, avanzamos i en m posiciones
                    // y marcamos recompute para recalcular el hash en la nueva ventana
                    i += m;
                    recompute = true;
                    continue;
                }
            }
        }

        // Avanzar ventana (Rolling Hash)
        // Actualizar rolling hash: quitar char viejo y añadir nuevo
        if (i < n - m) {
            h_txt = (p * (h_txt - text[i] * h) + text[i + m]) % mod;
            if (h_txt < 0) h_txt = (h_txt + mod);
        }
        i++;
    }
    return result;
}

// Construye el arreglo LPS (longest proper prefix which is suffix)
// LPS se usa por KMP para saber cuantos caracteres retroceder al encontrar mismatch
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

// KMP: busca todas las ocurrencias en O(n + m)
// allowOverlap determina si, despues de una coincidencia, se permite seguir buscando sobrelapada
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
                    // Permitir solapamiento: retroceder j segun lps para seguir buscando
                    j = lps[j - 1];
                } else {
                    // No permitir solapamiento: reiniciar j a 0
                    j = 0;
                }
            }
        } else if(j != 0) j = lps[j - 1];
        else i++;
    }
    return ans;
}

// MAIN donde juntamos los datos para darselos a los algoritmos
int main(int argc, char* argv[]) {
    ios_base::sync_with_stdio(false); cin.tie(NULL);

    // Se usa:
    // - PATRON: cadena a buscar
    // - RUTA: archivo CSV con lineas "nombre,sec" donde sec es la secuencia
    // - ALGORITMO: "KMP" o "Rabin-Karp" (por defecto KMP)
    // - SOLAPAMIENTO: "true"/"1" para permitir solapamiento, "false"/"0" para no
    if (argc < 3) { cout << "[]" << endl; return 1; }

    string patron = argv[1];
    string rutaArchivo = argv[2];
    string algoritmo = (argc > 3) ? argv[3] : "KMP";
    
    // Leer el argumento de solapamiento (por defecto true)
    string overlapArg = (argc > 4) ? argv[4] : "true";
    bool allowOverlap = (overlapArg == "true" || overlapArg == "1");

    // Abrir archivo CSV
    ifstream file(rutaArchivo);
    if (!file.is_open()) { cout << "[]" << endl; return 1; }

    string linea;
    cout << "["; // inicio del array JSON
    bool primero = true;

    // Procesar cada linea del CSV
    while (getline(file, linea)) {
        if (!linea.empty() && linea.back() == '\r') linea.pop_back(); // manejo CRLF
        stringstream ss(linea);
        string nombre, adn;

        // Extraer campos nombre y secuencia (adn)
        if (getline(ss, nombre, ',') && getline(ss, adn, ',')) {
            vector<int> coincidencias;
            
            // Medir tiempo de la busqueda
            auto start = high_resolution_clock::now();
            
            if (algoritmo == "Rabin-Karp") coincidencias = rabinKarp(adn, patron, allowOverlap);
            else coincidencias = KMP(adn, patron, allowOverlap);
            
            auto stop = high_resolution_clock::now();
            auto duration = duration_cast<microseconds>(stop - start);
            double tiempoMs = duration.count() / 1000.0; // microsegundos -> milisegundos

            // Si hay coincidencias, imprimir objeto JSON con campos relevantes
            if (!coincidencias.empty()) {
                if (!primero) cout << ","; // separar objetos
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
    cout << "]" << endl; // fin del array JSON
    return 0;
}
